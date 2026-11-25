import type { LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@shared/utils';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  readonly tone?: BadgeTone | undefined;
  readonly size?: BadgeSize | undefined;
  readonly icon?: LucideIcon | undefined;
  readonly className?: string | undefined;
  readonly title?: string | undefined;
  readonly children: ReactNode;
}

/** Small rounded label used for statuses, categories and counts. */
export const Badge = ({
  tone = 'neutral',
  size = 'md',
  icon: Icon,
  className,
  title,
  children,
}: BadgeProps): ReactElement => (
  <span className={cn(styles.badge, styles[tone], styles[size], className)} title={title}>
    {Icon !== undefined ? (
      <Icon size={size === 'sm' ? 11 : 12} aria-hidden="true" />
    ) : null}
    {children}
  </span>
);
