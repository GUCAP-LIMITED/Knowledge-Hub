import { useEffect, useRef, useState } from 'react';

/**
 * Debounced autosave. Persists the draft to localStorage and exposes a status
 * ('idle' | 'saving' | 'saved') the UI surfaces so the user is never anxious
 * about losing work — a core trust signal in long authoring flows.
 *
 * In production the `persist` callback would POST to a drafts endpoint; the
 * shape here keeps that swap a one-liner.
 */
export function useAutosave(key, data, { delay = 900, enabled = true } = {}) {
  const [status, setStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const first = useRef(true);
  const timer = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    // Skip the very first render so we don't show "saving" before any edit.
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ data, at: Date.now() }));
      } catch {
        /* quota / private mode — fail silently, draft simply isn't cached */
      }
      setStatus('saved');
      setLastSavedAt(Date.now());
    }, delay);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), enabled]);

  return { status, lastSavedAt };
}

/** Load a previously autosaved draft, if any. */
export function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}
