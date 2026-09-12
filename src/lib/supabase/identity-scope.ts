/** A local lifecycle guard; database policies remain responsible for authorization. */
let identity: string | null = null;
let revision = 0;

export function setIdentityScope(userId: string | null) {
  if (identity !== userId) {
    identity = userId;
    revision++;
    listeners.forEach((listener) => listener());
  }
}

export function identityRevision() {
  return revision;
}

export function isIdentityRevisionCurrent(value: number) {
  return value === revision;
}

const listeners = new Set<() => void>();
export function onIdentityChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function assertIdentityRevision(value: number) {
  if (!isIdentityRevisionCurrent(value)) throw new Error('Your session changed. Please reload.');
}
let partitioning = false;
export function isPartitioningStores() {
  return partitioning;
}
export function partitionIdentityStores(action: () => void) {
  partitioning = true;
  try {
    action();
  } finally {
    partitioning = false;
  }
}
