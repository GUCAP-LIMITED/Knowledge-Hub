import type { ReactElement } from 'react';
import { Skeleton } from './Skeleton';
import styles from './CardGridSkeleton.module.css';

export interface CardGridSkeletonProps {
  /** How many placeholder cards to render. */
  readonly count?: number;
}

/** A responsive grid of placeholder cards, shown while a card list loads. */
export const CardGridSkeleton = ({ count = 6 }: CardGridSkeletonProps): ReactElement => (
  <div className={styles.grid} aria-hidden="true">
    {Array.from({ length: count }, (_unused, index) => (
      <div key={`skeleton-${String(index)}`} className={styles.card}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="85%" height={22} />
        <Skeleton width="60%" height={14} />
        <Skeleton height={36} radius={10} />
      </div>
    ))}
  </div>
);
