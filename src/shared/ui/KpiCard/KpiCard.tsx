import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils';
import { Sparkline } from './Sparkline';
import styles from './KpiCard.module.css';

export type KpiTone = 'good' | 'bad' | 'muted';

export interface KpiDelta {
  readonly text: string;
  readonly tone: KpiTone;
  readonly dir?: 'up' | 'down';
}

export interface KpiCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly icon?: LucideIcon;
  /** When set, the whole card is a link to this route. */
  readonly to?: string;
  readonly spark?: readonly number[];
  readonly delta?: KpiDelta;
}

const Body = ({ label, value, icon: Icon, spark, delta }: KpiCardProps): ReactElement => (
  <>
    <div className={styles.head}>
      <span className={styles.label}>{label}</span>
      {Icon !== undefined ? (
        <span className={styles.iconChip}>
          <Icon size={15} aria-hidden="true" />
        </span>
      ) : null}
    </div>
    <div className={styles.value}>{value}</div>
    <div className={styles.foot}>
      {spark !== undefined ? (
        <Sparkline values={spark} label={`${label} trend`} />
      ) : (
        <span />
      )}
      {delta !== undefined ? (
        <span className={cn(styles.delta, styles[`delta_${delta.tone}`])}>
          {delta.dir === 'down' ? (
            <ArrowDownRight size={13} aria-hidden="true" />
          ) : delta.dir === 'up' ? (
            <ArrowUpRight size={13} aria-hidden="true" />
          ) : null}
          {delta.text}
        </span>
      ) : null}
    </div>
  </>
);

/** A single dashboard metric: label · value · trend, optionally a link to drill in. */
export const KpiCard = (props: KpiCardProps): ReactElement => {
  const { label, value, to, delta } = props;
  const aria = `${label}: ${String(value)}${delta !== undefined ? `, ${delta.text}` : ''}`;
  const inner: ReactNode = <Body {...props} />;

  if (to !== undefined) {
    return (
      <Link
        to={to}
        className={cn(styles.card, styles.link)}
        aria-label={`${aria} — open`}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className={styles.card} aria-label={aria}>
      {inner}
    </div>
  );
};
