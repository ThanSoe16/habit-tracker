/** A local lifecycle guard; database policies remain responsible for authorization. */
let identity: string | null = null;
let revision = 0;

export function setIdentityScope(userId: string | null) {
  if (identity !== userId) {
    identity = userId;
    revision++;
  }
}

export function identityRevision() {
  return revision;
}

export function isIdentityRevisionCurrent(value: number) {
  return value === revision;
}
