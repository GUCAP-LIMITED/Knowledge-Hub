import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils';
import styles from './CertificatesPage.module.css';

export interface CertificatesPaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

export const CertificatesPagination = ({
  page,
  totalPages,
  onPageChange,
}: CertificatesPaginationProps): ReactElement | null => {
  if (totalPages <= 1) {
    return null;
  }
  return (
    <nav className={styles.pagination} aria-label="Certificates pagination">
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => {
          onPageChange(Math.max(1, page - 1));
        }}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => {
              onPageChange(pageNum);
            }}
            className={cn(styles.pageBtn, page === pageNum && styles.pageBtnActive)}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => {
          onPageChange(Math.min(totalPages, page + 1));
        }}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
};
