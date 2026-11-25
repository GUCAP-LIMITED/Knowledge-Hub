import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import styles from './ReviewsPagination.module.css';

export interface ReviewsPaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly onPageChange: (page: number) => void;
  readonly disabled?: boolean;
}

export const ReviewsPagination = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  disabled = false,
}: ReviewsPaginationProps): ReactElement | null => {
  if (totalCount <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = Math.min((page - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <nav className={styles.pagination} aria-label="Reviews pagination">
      <div className={styles.info}>
        Showing {startItem}–{endItem} of {totalCount} reviews
      </div>

      <div className={styles.controls}>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || disabled}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          Previous
        </Button>

        <span className={styles.pageIndicator}>
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || disabled}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
