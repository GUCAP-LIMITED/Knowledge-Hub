import type { ReactElement } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@shared/utils';
import type { ToastItem, ToastTone } from './use-toasts';
import styles from './Toast.module.css';

const ICONS: Record<ToastTone, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export interface ToastViewportProps {
  readonly toasts: readonly ToastItem[];
  readonly onDismiss: (id: number) => void;
}

/** Fixed bottom-right stack of active toasts. */
export const ToastViewport = ({
  toasts,
  onDismiss,
}: ToastViewportProps): ReactElement => (
  <div className={styles.viewport}>
    {toasts.map((toast) => {
      const Icon = ICONS[toast.tone];
      return (
        <div
          key={toast.id}
          className={cn(styles.toast, styles[toast.tone])}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
        >
          <Icon size={18} aria-hidden="true" className={styles.icon} />
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.close}
            aria-label="Dismiss notification"
            onClick={() => {
              onDismiss(toast.id);
            }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      );
    })}
  </div>
);
