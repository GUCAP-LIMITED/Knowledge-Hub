import type { ReactElement } from 'react';
import { Skeleton } from './Skeleton';
import styles from './RowListSkeleton.module.css';

export interface RowListSkeletonProps {
  /** How many placeholder rows to render. */
  readonly count?: number;
  /** Render a leading circular placeholder (avatar/icon). */
  readonly leading?: boolean;
  /** Render a trailing action-shaped placeholder (button/chip). */
  readonly trailing?: boolean;
}

/** A vertical list of placeholder rows, shown while a row-shaped list (teams, users, quizzes…) loads. */
export const RowListSkeleton = ({
  count = 5,
  leading = false,
  trailing = false,
}: RowListSkeletonProps): ReactElement => (
  <div className={styles.list} aria-hidden="true">
    {Array.from({ length: count }, (_unused, index) => (
      <div key={`skeleton-row-${String(index)}`} className={styles.row}>
        {leading ? <Skeleton width={32} height={32} radius={999} /> : null}
        <div className={styles.body}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="35%" height={12} />
        </div>
        {trailing ? <Skeleton width={72} height={28} radius={8} /> : null}
      </div>
    ))}
  </div>
);
