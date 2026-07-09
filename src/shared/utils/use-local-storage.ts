import { useCallback, useState } from 'react';

/**
 * State backed by localStorage. Reads once on mount and writes on every update. Storage failures
 * (private mode, quota) degrade gracefully to in-memory state.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): readonly [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return initial;
      }
      const parsed: unknown = JSON.parse(raw);
      return parsed as T;
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: T): void => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore persistence failures
      }
    },
    [key],
  );

  return [value, update];
}
