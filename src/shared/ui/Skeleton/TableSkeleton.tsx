import type { ReactElement } from 'react';
import { Skeleton } from './Skeleton';
import styles from './TableSkeleton.module.css';

export interface TableSkeletonProps {
  /** How many placeholder rows to render (in addition to the header row). */
  readonly rows?: number;
  /** How many columns each row has. */
  readonly columns?: number;
}

/** A placeholder table — a header bar plus N rows of column bars — shown while tabular data loads. */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
}: TableSkeletonProps): ReactElement => {
  const cells = Array.from({ length: columns }, (_unused, index) => index);
  return (
    <div className={styles.table} aria-hidden="true">
      <div className={styles.headerRow}>
        {cells.map((cell) => (
          <Skeleton key={`skeleton-head-${String(cell)}`} width="60%" height={12} />
        ))}
      </div>
      {Array.from({ length: rows }, (_unused, rowIndex) => (
        <div key={`skeleton-row-${String(rowIndex)}`} className={styles.row}>
          {cells.map((cell) =>
            cell === 0 ? (
              <div key={`skeleton-cell-${String(cell)}`} className={styles.identityCell}>
                <Skeleton width={28} height={28} radius={999} />
                <Skeleton width="70%" height={13} />
              </div>
            ) : (
              <Skeleton key={`skeleton-cell-${String(cell)}`} width="75%" height={13} />
            ),
          )}
        </div>
      ))}
    </div>
  );
};
