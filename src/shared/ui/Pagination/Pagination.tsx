import type { ReactElement } from 'react';
import { Button } from '@shared/ui/Button/Button';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Zero-based current page. */
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly onPageChange: (page: number) => void;
}

/** Previous / Next pager with a "from-to of total" summary. Renders nothing for a single page. */
export const Pagination = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationProps): ReactElement | null => {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  if (pageCount === 1) {
    return null;
  }
  const from = page * pageSize + 1;
  const to = Math.min(totalCount, (page + 1) * pageSize);
  return (
    <nav className={styles.root} aria-label="Pagination">
      <span className={styles.summary}>
        {from}–{to} of {totalCount}
      </span>
      <div className={styles.controls}>
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 0}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          Previous
        </Button>
        <span className={styles.page}>
          Page {page + 1} of {pageCount}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pageCount - 1}
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
