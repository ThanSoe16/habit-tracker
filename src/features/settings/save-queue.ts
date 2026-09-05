/** Serialize writes and retain the newest unsaved snapshot for retry. */
export function createSaveQueue<T>(
  write: (value: T) => Promise<void>,
  onStatus: (status: 'saving' | 'saved' | 'error', error?: string) => void,
) {
  let pending: { value: T } | undefined;
  let running = false;
  let revision = 0;
  const flush = async () => {
    if (running || !pending) return;
    running = true;
    onStatus('saving');
    while (pending) {
      const next = pending;
      pending = undefined;
      try {
        await write(next.value);
      } catch (error) {
        pending ??= next;
        running = false;
        onStatus('error', error instanceof Error ? error.message : 'Unable to save changes.');
        return;
      }
    }
    running = false;
    onStatus('saved');
  };
  return {
    save(value: T) {
      revision++;
      pending = { value };
      void flush();
    },
    retry() {
      void flush();
    },
    get hasPending() {
      return running || !!pending;
    },
    get revision() {
      return revision;
    },
  };
}
