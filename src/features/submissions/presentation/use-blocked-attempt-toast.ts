import { useContext, useEffect, useRef } from 'react';
import { ToastContext } from '@shared/ui';

const SHOWN_ITEMS = 3;

const summarize = (missing: readonly string[]): string => {
  const shown = missing.slice(0, SHOWN_ITEMS).join(', ');
  const extra = missing.length - SHOWN_ITEMS;
  const rest = extra > 0 ? ` and ${String(extra)} more` : '';
  return `Can't continue yet. Still needed: ${shown}${rest}.`;
};

/**
 * Raises one error toast per blocked continue/publish attempt, naming what is still missing —
 * the inline markers can be off-screen or in another panel. Toasts are optional: without a
 * provider (isolated component tests) this is a no-op.
 */
export const useBlockedAttemptToast = (
  attempt: number,
  missing: readonly string[],
): void => {
  const toast = useContext(ToastContext);
  const lastHandled = useRef(0);

  useEffect(() => {
    if (attempt === 0) {
      lastHandled.current = 0;
      return;
    }
    if (attempt === lastHandled.current || missing.length === 0) return;
    lastHandled.current = attempt;
    toast?.error(summarize(missing));
  }, [attempt, missing, toast]);
};
