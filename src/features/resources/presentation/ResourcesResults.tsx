import type { ReactElement, RefObject } from 'react';
import { Alert, Button, CardGridSkeleton, EmptyState } from '@shared/ui';
import type { Resource } from '../domain';
import { ResourceCard } from './ResourceCard';
import styles from './ResourcesPage.module.css';

export interface ResourcesResultsProps {
  readonly resources: readonly Resource[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  /** True when a search or filter is narrowing the list (changes the empty message). */
  readonly filtered: boolean;
  readonly removingId: string | null;
  readonly hasNextPage?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly sentinelRef?: RefObject<HTMLDivElement> | undefined;
  readonly totalCount?: number | undefined;
  readonly onEdit: (resource: Resource) => void;
  readonly onDelete: (id: string) => void;
  readonly onClearAll: () => void;
}

const ResourcesListFooter = ({
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
          <span>Loading more resources...</span>
        </div>
      ) : null}

      {hasNextPage && sentinelRef ? (
        <div ref={sentinelRef} className={styles.sentinel} />
      ) : (
        <div className={styles.endBanner}>
          <span className={styles.endBannerTitle}>You&apos;re all caught up!</span>
          <span className={styles.endBannerSub}>
            Displaying {count} of {displayTotal}{' '}
            {displayTotal === 1 ? 'resource' : 'resources'}
          </span>
        </div>
      )}
    </>
  );
};

/** Loading / error / empty / grid states for the knowledge base catalog. */
export const ResourcesResults = ({
  resources,
  isLoading,
  error,
  filtered,
  removingId,
  hasNextPage = false,
  isFetchingNextPage = false,
  sentinelRef,
  totalCount,
  onEdit,
  onDelete,
  onClearAll,
}: ResourcesResultsProps): ReactElement => {
  if (isLoading) {
    return <CardGridSkeleton />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load resources">
        {error.message}
      </Alert>
    );
  }
  if (resources.length === 0) {
    return filtered ? (
      <EmptyState
        title="No resources match"
        description="Try a different search term or clear your filters."
        action={
          <Button variant="outline" onClick={onClearAll}>
            Clear all filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No resources yet"
        description="Resources will appear here once they're published."
      />
    );
  }
  return (
    <>
      <div className={styles.grid}>
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            isBusy={resource.id === removingId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <ResourcesListFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        count={resources.length}
        totalCount={totalCount}
      />
    </>
  );
};
