import type { ReactElement, RefObject } from 'react';
import { Alert, Button, CardGridSkeleton, EmptyState } from '@shared/ui';
import type { Tutorial } from '../domain';
import { TutorialCard } from './TutorialCard';
import styles from './TutorialsPage.module.css';

export interface TutorialsResultsProps {
  readonly tutorials: readonly Tutorial[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  /** True when a search or filter is narrowing the list (changes the empty message). */
  readonly filtered: boolean;
  readonly removingId: string | null;
  readonly hasNextPage?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly sentinelRef?: RefObject<HTMLDivElement> | undefined;
  readonly totalCount?: number | undefined;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
  readonly onClearAll: () => void;
}

const TutorialsListFooter = ({
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
  count,
  totalCount,
}: {
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly sentinelRef?: RefObject<HTMLDivElement> | undefined;
  readonly count: number;
  readonly totalCount?: number | undefined;
}): ReactElement => {
  const displayTotal = totalCount ?? count;
  return (
    <>
      {isFetchingNextPage ? (
        <div className={styles.loadingMoreContainer} role="status">
          <div className={styles.spinner} />
          <span>Loading more tutorials...</span>
        </div>
      ) : null}

      {hasNextPage && sentinelRef ? (
        <div ref={sentinelRef} className={styles.sentinel} />
      ) : (
        <div className={styles.endBanner}>
          <span className={styles.endBannerTitle}>You&apos;re all caught up!</span>
          <span className={styles.endBannerSub}>
            Displaying {count} of {displayTotal}{' '}
            {displayTotal === 1 ? 'tutorial' : 'tutorials'}
          </span>
        </div>
      )}
    </>
  );
};

/** Loading / error / empty / grid states for the tutorials library. */
export const TutorialsResults = ({
  tutorials,
  isLoading,
  error,
  filtered,
  removingId,
  hasNextPage = false,
  isFetchingNextPage = false,
  sentinelRef,
  totalCount,
  onWatch,
  onEdit,
  onDelete,
  onClearAll,
}: TutorialsResultsProps): ReactElement => {
  if (isLoading) {
    return <CardGridSkeleton />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load tutorials">
        {error.message}
      </Alert>
    );
  }
  if (tutorials.length === 0) {
    return filtered ? (
      <EmptyState
        title="No tutorials match"
        description="Try a different search term or category."
        action={
          <Button variant="outline" onClick={onClearAll}>
            Clear all filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No tutorials yet"
        description="Tutorials will appear here once they're published."
      />
    );
  }
  return (
    <>
      <div className={styles.grid}>
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            isBusy={tutorial.id === removingId}
            onWatch={onWatch}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <TutorialsListFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        count={tutorials.length}
        totalCount={totalCount}
      />
    </>
  );
};
