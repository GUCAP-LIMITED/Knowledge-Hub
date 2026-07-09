import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './StatCard.module.css';

export type StatTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger';

export interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly icon: LucideIcon;
  readonly tone?: StatTone;
  readonly hint?: string;
  /** Month-over-month change as a signed percentage; renders an up/down indicator. */
  readonly trend?: number;
}

/** Compact metric tile: a label, a large value, an accented icon and an optional hint or trend. */
export const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  hint,
  trend,
}: StatCardProps): ReactElement => (
  <div className={styles.card}>
    <div className={styles.top}>
      <span className={styles.label}>{label}</span>
      <span className={cn(styles.iconTile, styles[tone])}>
        <Icon size={16} aria-hidden="true" />
      </span>
    </div>
    <div className={styles.value}>{value}</div>
    {trend !== undefined ? (
      <div className={cn(styles.trend, trend >= 0 ? styles.trendUp : styles.trendDown)}>
        {trend >= 0 ? (
          <TrendingUp size={13} aria-hidden="true" />
        ) : (
          <TrendingDown size={13} aria-hidden="true" />
        )}
        {trend >= 0 ? '+' : ''}
        {trend}% this month
      </div>
    ) : null}
    {hint !== undefined ? <div className={styles.hint}>{hint}</div> : null}
  </div>
);
