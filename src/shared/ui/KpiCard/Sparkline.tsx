import type { ReactElement } from 'react';
import styles from './KpiCard.module.css';

const W = 104;
const H = 28;
const PAD = 2;

const toPath = (values: readonly number[]): string => {
  if (values.length < 2) {
    return '';
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (W - PAD * 2) / (values.length - 1);
  return values
    .map((value, i) => {
      const x = PAD + i * step;
      const y = H - PAD - ((value - min) / span) * (H - PAD * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
};

export interface SparklineProps {
  readonly values: readonly number[];
  /** Accessible description; the sparkline is decorative alongside the numeric delta. */
  readonly label: string;
}

/** Tiny inline trend chart. Decorative — the real figure is always the value + delta beside it. */
export const Sparkline = ({ values, label }: SparklineProps): ReactElement => (
  <svg
    className={styles.spark}
    viewBox={`0 0 ${String(W)} ${String(H)}`}
    preserveAspectRatio="none"
    role="img"
    aria-label={label}
  >
    <path className={styles.sparkLine} d={toPath(values)} fill="none" />
  </svg>
);
