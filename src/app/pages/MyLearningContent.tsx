import type { ReactElement, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, RotateCcw } from 'lucide-react';
import { Alert, Button, CardGridSkeleton, EmptyState } from '@shared/ui';
import { MyLearningCard, type MyLearningItem } from '@features/my-learning';
import styles from './MyLearningPage.module.css';

export interface MyLearningContentProps {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
  readonly items: readonly MyLearningItem[];
  readonly hasActiveFilters: boolean;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly onClearAll: () => void;
}

// eslint-disable-next-line max-lines-per-function
export const MyLearningContent = ({
  isLoading,
  isError,
  error,
  refetch,
  items,
  hasActiveFilters,
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
  onClearAll,
}: MyLearningContentProps): ReactElement => {
  if (isError) {
    return (
      <Alert tone="error" title="Could not load your learning items">
        <div>
          <p>{error?.message}</p>
          <Button variant="outline" onClick={refetch} className={styles.retryBtn}>
            <RotateCcw aria-hidden="true" />
            <span>Retry</span>
          </Button>
        </div>
      </Alert>
    );
  }

  if (isLoading) {
    return <CardGridSkeleton count={12} />;
  }

  if (items.length === 0) {
    if (hasActiveFilters) {
      return (
        <EmptyState
          title="No matching learning items"
          description="Try adjusting your search terms or filters to find what you're looking for."
          action={
            <Button variant="outline" onClick={onClearAll}>
              Clear all filters
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        title="Start your learning journey"
        description="You don't have any enrolled courses or assignments yet. Explore the catalog to discover new content."
        action={
          <Button asChild>
            <Link to="/courses">
              <BookOpen aria-hidden="true" />
              <span>Browse catalog</span>
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {items.map((item) => (
          <MyLearningCard
            key={`${item.origin}-${item.contentType}-${item.id}`}
            item={item}
          />
        ))}
      </div>

      {isFetchingNextPage ? (
        <div className={styles.loadingMoreContainer} role="status">
          <div className={styles.spinner} />
          <span>Loading more items...</span>
        </div>
      ) : null}

      {hasNextPage ? (
        <div ref={sentinelRef} className={styles.sentinel} />
      ) : (
        <div className={styles.endBanner}>
          <span className={styles.endBannerTitle}>You&apos;re all caught up!</span>
          <span className={styles.endBannerSub}>
            Displaying all {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}
    </>
  );
};
