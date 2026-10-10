import type { StateStorage } from 'zustand/middleware';

/** Serialize writes and retain failed drafts for an explicit retry. */
export function createQueuedStorage(
  load: () => Promise<StateStorage>,
  report: (pending: boolean, failed: boolean) => void,
) {
  let tail: Promise<void> = Promise.resolve();
  const drafts = new Map<string, string | null>();
  let pending = 0;
  let failure: unknown;

  function write(key: string, value: string | null) {
    drafts.set(key, value);
    pending++;
    report(true, Boolean(failure));
    tail = tail.then(async () => {
      try {
        const storage = await load();
        if (value === null) await storage.removeItem(key);
        else await storage.setItem(key, value);
        if (drafts.get(key) === value) drafts.delete(key);
        if (!drafts.size) failure = undefined;
      } catch (error) {
        failure = error;
      } finally {
        pending--;
        report(pending > 0, Boolean(failure));
      }
    });
    return tail;
  }

  return {
    storage: {
      async getItem(key) {
        await tail;
        if (drafts.has(key)) {
          throw new Error('Local changes have not been saved. Retry before reloading.');
        }
        return (await load()).getItem(key);
      },
      setItem: write,
      removeItem: (key) => write(key, null),
    } satisfies StateStorage,
    async flush() {
      let current;
      do {
        current = tail;
        await current;
      } while (current !== tail);
      if (failure) throw failure;
    },
    async retry() {
      for (const [key, value] of drafts) void write(key, value);
      await tail;
      if (failure) throw failure;
    },
  };
}
