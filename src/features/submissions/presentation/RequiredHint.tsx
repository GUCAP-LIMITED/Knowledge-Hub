import type { ReactElement, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@shared/utils';
import { useIsFlagged, useSubmitAttempt } from './submit-attempt-context';
import styles from './RequiredHint.module.css';

/**
 * Wraps a required control so it shakes once per blocked attempt while `invalid`. Keyed by the
 * attempt count so the CSS animation restarts on every click instead of only the first.
 */
export const ShakeOnAttempt = ({
  invalid,
  children,
}: {
  readonly invalid: boolean;
  readonly children: ReactNode;
}): ReactElement => {
  const attempt = useSubmitAttempt();
  const shaking = useIsFlagged(invalid);
  return (
    <div key={attempt} className={cn(shaking && styles.shake)}>
      {children}
    </div>
  );
};

/** "This is required" message shown under a required control after a blocked attempt. */
export const RequiredMessage = ({
  invalid,
  children,
}: {
  readonly invalid: boolean;
  readonly children: ReactNode;
}): ReactElement | null => {
  const flagged = useIsFlagged(invalid);
  if (!flagged) return null;
  return (
    <p className={styles.message} role="alert">
      <AlertCircle size={14} aria-hidden="true" />
      {children}
    </p>
  );
};
