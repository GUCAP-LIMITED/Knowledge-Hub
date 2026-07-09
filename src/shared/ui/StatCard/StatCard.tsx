import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './StatCard.module.css';

export type StatTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning';

export interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly icon: LucideIcon;
  readonly tone?: StatTone;
  readonly hint?: string;
}

/** Compact metric tile: a label, a large value, an accented icon and an optional hint. */
export const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  hint,
}: StatCardProps): ReactElement => (
  <div className={styles.card}>
    <div className={styles.top}>
      <span className={styles.label}>{label}</span>
      <span className={cn(styles.iconTile, styles[tone])}>
        <Icon size={16} aria-hidden="true" />
      </span>
    </div>
    <div className={styles.value}>{value}</div>
    {hint !== undefined ? <div className={styles.hint}>{hint}</div> : null}
  </div>
);
