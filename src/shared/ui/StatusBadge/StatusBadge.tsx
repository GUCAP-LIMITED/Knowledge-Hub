import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './StatusBadge.module.css';

export type StatusTone =
  | 'neutral'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface StatusBadgeProps {
  readonly tone: StatusTone;
  readonly label: string;
  /** Show the leading status dot (default true). Set false for a plain tonal chip. */
  readonly dot?: boolean;
}

/**
 * A compact tonal status pill: a coloured dot + label. One badge language across every screen so
 * "Active", "Pending", "Overdue" etc. always read the same way.
 */
export const StatusBadge = ({
  tone,
  label,
  dot = true,
}: StatusBadgeProps): ReactElement => (
  <span className={cn(styles.badge, styles[tone])}>
    {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
    {label}
  </span>
);
