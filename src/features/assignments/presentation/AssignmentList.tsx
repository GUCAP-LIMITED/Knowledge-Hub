import type { ReactElement, RefObject } from 'react';
import { Alert, Button, CardGridSkeleton, EmptyState } from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import type { Assignment } from '../domain';
import { AssignmentCard } from './AssignmentCard';
import { AssignmentToolbar } from './AssignmentToolbar';
import type { AssignmentFilter } from './assignment-filters';
import styles from './AssignTrainingPage.module.css';

export interface AssignmentListProps {
  readonly list: readonly Assignment[];
  readonly tab: AssignmentFilter;
  readonly counts: Record<AssignmentFilter, number>;
  readonly loading: boolean;
  readonly query: string;
  readonly error: Error | null;
  readonly deleting: boolean;
  readonly hasNextPage?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly sentinelRef?: RefObject<HTMLDivElement> | undefined;
  readonly totalCount?: number | undefined;
  readonly onTab: (value: AssignmentFilter) => void;
  readonly onQuery: (value: string) => void;
  readonly onNew: () => void;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}

const AssignmentsListFooter = ({
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
          <span>Loading more assignments...</span>
        </div>
      ) : null}

      {hasNextPage && sentinelRef ? (
        <div ref={sentinelRef} className={styles.sentinel} />
      ) : count > 0 ? (
        <div className={styles.endBanner}>
          <span className={styles.endBannerTitle}>You&apos;re all caught up!</span>
          <span className={styles.endBannerSub}>
            Displaying {count} of {displayTotal}{' '}
            {displayTotal === 1 ? 'assignment' : 'assignments'}
          </span>
        </div>
      ) : null}
    </>
  );
};

const resolveEmptyContent = (
  query: string,
  tab: AssignmentFilter,
): { readonly title: string; readonly description: string } => {
  if (query !== '') {
    return {
      title: 'No assignments found',
      description: 'Try a different search.',
    };
  }
  if (tab === 'all') {
    return {
      title: 'No assignments yet',
      description: "Create one to keep your team's learning on track.",
    };
  }
  return {
    title: `No ${tab} assignments`,
    description: 'There are no assignments with this status right now.',
  };
};

const AssignmentsEmptyState = ({
  query,
  tab,
  canCreate,
  onNew,
}: {
  readonly query: string;
  readonly tab: AssignmentFilter;
  readonly canCreate: boolean;
  readonly onNew: () => void;
}): ReactElement => {
  const { title, description } = resolveEmptyContent(query, tab);
  const showAction = tab === 'all' && query === '' && canCreate;
  return (
    <EmptyState
      title={title}
      description={description}
      action={showAction ? <Button onClick={onNew}>New assignment</Button> : undefined}
    />
  );
};

/** The error / empty / toolbar + card-grid body of the Assign Training page. */
export const AssignmentList = ({
  list,
  tab,
  counts,
  loading,
  query,
  error,
  deleting,
  hasNextPage = false,
  isFetchingNextPage = false,
  sentinelRef,
  totalCount,
  onTab,
  onQuery,
  onNew,
  onView,
  onDelete,
}: AssignmentListProps): ReactElement => {
  const { can } = useMyCapabilities();
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load assignments">
        {error.message}
      </Alert>
    );
  }

  return (
    <div className={styles.body}>
      <AssignmentToolbar
        query={query}
        tab={tab}
        counts={counts}
        onQuery={onQuery}
        onTab={onTab}
      />
      {loading && list.length === 0 ? (
        <CardGridSkeleton />
      ) : list.length === 0 ? (
        <AssignmentsEmptyState
          query={query}
          tab={tab}
          canCreate={can('assign', 'create')}
          onNew={onNew}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {list.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                deleting={deleting}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </div>

          <AssignmentsListFooter
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            sentinelRef={sentinelRef}
            count={list.length}
            totalCount={totalCount}
          />
        </>
      )}
    </div>
  );
};
