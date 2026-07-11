import { useMemo, type ReactElement, type ReactNode } from 'react';
import { ToastContext, type ToastApi } from './toast-context';
import { ToastViewport } from './Toast';
import { useToasts } from './use-toasts';

export interface ToastProviderProps {
  readonly children: ReactNode;
}

/** Owns the toast queue and renders the viewport once, so any descendant can raise toasts. */
export const ToastProvider = ({ children }: ToastProviderProps): ReactElement => {
  const { toasts, push, dismiss } = useToasts();
  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (message: string): void => {
        push('success', message);
      },
      error: (message: string): void => {
        push('error', message);
      },
      info: (message: string): void => {
        push('info', message);
      },
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
