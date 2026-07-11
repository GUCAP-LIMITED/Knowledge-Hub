import { useEffect } from 'react';
import { useToast } from '@shared/ui';
import type { ErrorNotifier } from '@app/di/composition-root';

export interface ToastErrorBridgeProps {
  readonly notifier: ErrorNotifier;
}

/** Binds the live toast handler into the composition's error notifier so mutation failures surface. */
export const ToastErrorBridge = ({ notifier }: ToastErrorBridgeProps): null => {
  const { error } = useToast();

  useEffect(() => {
    notifier.bind(error);
  }, [notifier, error]);

  return null;
};
