import type { ReactElement } from 'react';
import { Skeleton } from './Skeleton';
import styles from './StatCardsSkeleton.module.css';

export interface StatCardsSkeletonProps {
  /** How many placeholder stat tiles to render. */
  readonly count?: number;
}

/** A row of placeholder metric tiles, shown while dashboard/summary stats load. */
export const StatCardsSkeleton = ({
  count = 4,
}: StatCardsSkeletonProps): ReactElement => (
  <div className={styles.grid} aria-hidden="true">
    {Array.from({ length: count }, (_unused, index) => (
      <div key={`skeleton-stat-${String(index)}`} className={styles.card}>
        <div className={styles.top}>
          <Skeleton width="50%" height={12} />
          <Skeleton width={32} height={32} radius={8} />
        </div>
        <Skeleton width="40%" height={26} />
      </div>
    ))}
  </div>
);
