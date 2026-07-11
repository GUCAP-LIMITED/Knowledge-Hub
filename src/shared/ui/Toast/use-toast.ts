import { useContext } from 'react';
import { ToastContext, type ToastApi } from './toast-context';

/** Access the app-level toast API. Must be used within `<ToastProvider>`. */
export const useToast = (): ToastApi => {
  const api = useContext(ToastContext);
  if (api === null) {
    throw new Error('useToast must be used within <ToastProvider>.');
  }
  return api;
};
