import type { MockState } from './mock-state';

/** Bump when the shape of `MockState` or its seeds changes, so stale snapshots are discarded. */
const SNAPSHOT_VERSION = 1;
export const MOCK_STATE_KEY = 'uapp:mock-state';

export interface SnapshotStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface Tagged {
  readonly __t: 'Map' | 'Set';
  readonly v: unknown[];
}

const isTagged = (value: unknown): value is Tagged =>
  typeof value === 'object' && value !== null && '__t' in value && 'v' in value;

const replacer = (_key: string, value: unknown): unknown => {
  if (value instanceof Map) return { __t: 'Map', v: [...value] };
  if (value instanceof Set) return { __t: 'Set', v: [...value] };
  return value;
};

const reviver = (_key: string, value: unknown): unknown => {
  if (!isTagged(value)) return value;
  return value.__t === 'Map'
    ? new Map(value.v as [unknown, unknown][])
    : new Set(value.v);
};

/** Replaces the contents of `target` with `source` while keeping `target`'s identity. */
const fillInPlace = (target: unknown, source: unknown): void => {
  if (Array.isArray(target) && Array.isArray(source)) {
    target.splice(0, target.length, ...(source as unknown[]));
  } else if (target instanceof Map && source instanceof Map) {
    target.clear();
    source.forEach((v, k) => target.set(k, v));
  } else if (target instanceof Set && source instanceof Set) {
    target.clear();
    source.forEach((v) => target.add(v));
  } else if (
    typeof target === 'object' &&
    target !== null &&
    typeof source === 'object' &&
    source !== null
  ) {
    Object.assign(target, source);
  }
};

/** Keys that are rebuilt on every load rather than restored. */
const TRANSIENT: readonly string[] = ['now'];

/** Serialises the mutable world into storage (best effort — quota errors are ignored). */
export const saveMockState = (state: MockState, storage: SnapshotStorage): void => {
  try {
    storage.setItem(
      MOCK_STATE_KEY,
      JSON.stringify({ version: SNAPSHOT_VERSION, state }, replacer),
    );
  } catch {
    // Storage full or unavailable: the demo keeps working, it just will not survive a reload.
  }
};

/** Restores a saved snapshot into `state` in place. Returns whether one was applied. */
export const restoreMockState = (state: MockState, storage: SnapshotStorage): boolean => {
  const raw = storage.getItem(MOCK_STATE_KEY);
  if (raw === null) return false;
  try {
    const parsed = JSON.parse(raw, reviver) as {
      version?: number;
      state?: Record<string, unknown>;
    };
    if (parsed.version !== SNAPSHOT_VERSION || parsed.state === undefined) return false;
    for (const key of Object.keys(state).filter((k) => !TRANSIENT.includes(k))) {
      fillInPlace((state as unknown as Record<string, unknown>)[key], parsed.state[key]);
    }
    return true;
  } catch {
    storage.removeItem(MOCK_STATE_KEY);
    return false;
  }
};

/** Forgets the saved demo data, so the next load starts from the seed. */
export const clearMockState = (storage: SnapshotStorage): void => {
  storage.removeItem(MOCK_STATE_KEY);
};
