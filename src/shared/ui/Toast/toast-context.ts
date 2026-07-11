import { createContext } from 'react';
import type { ToastTone } from './use-toasts';

/** The app-level toast API exposed through `useToast()`. */
export interface ToastApi {
  readonly push: (tone: ToastTone, message: string) => void;
  readonly success: (message: string) => void;
  readonly error: (message: string) => void;
  readonly info: (message: string) => void;
}

/** Populated by `ToastProvider` at the composition root. */
export const ToastContext = createContext<ToastApi | null>(null);
