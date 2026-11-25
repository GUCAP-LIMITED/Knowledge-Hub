import type { ReactElement, RefObject } from 'react';
import styles from './SubmissionsPage.module.css';

export interface SubmissionsListFooterProps {
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly count: number;
  readonly totalCount: number;
}

export const SubmissionsListFooter = ({
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
  count,
  totalCount,
}: SubmissionsListFooterProps): ReactElement => (
  <>
    {isFetchingNextPage ? (
      <div className={styles.loadingMoreContainer} role="status">
        <div className={styles.spinner} />
        <span>Loading more submissions...</span>
      </div>
    ) : null}

    {hasNextPage ? (
      <div ref={sentinelRef} className={styles.sentinel} />
    ) : (
      <div className={styles.endBanner}>
        <span className={styles.endBannerSub}>
          Displaying {count} of {totalCount} {totalCount === 1 ? 'document' : 'documents'}
        </span>
      </div>
    )}
  </>
);
