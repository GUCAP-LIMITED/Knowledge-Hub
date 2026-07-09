import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  readonly value: number;
  readonly showLabel?: boolean;
  /** 'auto' turns green at 100%. */
  readonly tone?: 'auto' | 'primary' | 'success';
}

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

/** Horizontal completion bar. */
export const ProgressBar = ({
  value,
  showLabel,
  tone = 'auto',
}: ProgressBarProps): ReactElement => {
  const pct = clamp(value);
  const complete = tone === 'success' || (tone === 'auto' && pct >= 100);
  return (
    <div>
      <div className={styles.track}>
        <div
          className={cn(styles.fill, complete && styles.complete)}
          style={{ width: `${String(pct)}%` }}
        />
      </div>
      {showLabel === true ? (
        <div className={styles.label}>
          {pct === 100 ? 'Complete' : `${String(pct)}% complete`}
        </div>
      ) : null}
    </div>
  );
};
