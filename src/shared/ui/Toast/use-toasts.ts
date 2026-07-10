import { useCallback, useRef, useState } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
  readonly id: number;
  readonly tone: ToastTone;
  readonly message: string;
}

export interface UseToastsResult {
  readonly toasts: readonly ToastItem[];
  readonly push: (tone: ToastTone, message: string) => void;
  readonly dismiss: (id: number) => void;
}

const AUTO_DISMISS_MS = 3800;

/** Local, self-dismissing toast queue. Pair with `ToastViewport` to render the stack. */
export const useToasts = (): UseToastsResult => {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string): void => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current, { id, tone, message }]);
      setTimeout(() => {
        dismiss(id);
      }, AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
};
