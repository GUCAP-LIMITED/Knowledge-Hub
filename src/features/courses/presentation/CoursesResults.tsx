import type { ReactElement, RefObject } from 'react';
import { Alert, Button, CardGridSkeleton, EmptyState } from '@shared/ui';
import type { Course } from '../domain';
import { CourseCard } from './CourseCard';
import styles from './CoursesPage.module.css';

export interface CoursesResultsProps {
  readonly courses: readonly Course[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  /** True when a search or filter is narrowing the list (changes the empty message). */
  readonly filtered: boolean;
  readonly advancingId: string | null;
  readonly removingId: string | null;
  readonly hasNextPage?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly sentinelRef?: RefObject<HTMLDivElement> | undefined;
  readonly totalCount?: number | undefined;
  readonly onAdvance: (course: Course) => void;
  readonly onEdit: (course: Course) => void;
  readonly onDelete: (id: string) => void;
  readonly onClearAll: () => void;
}

const CoursesListFooter = ({
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
          <span>Loading more courses...</span>
        </div>
      ) : null}

      {hasNextPage && sentinelRef ? (
        <div ref={sentinelRef} className={styles.sentinel} />
      ) : (
        <div className={styles.endBanner}>
          <span className={styles.endBannerTitle}>You&apos;re all caught up!</span>
          <span className={styles.endBannerSub}>
            Displaying {count} of {displayTotal}{' '}
            {displayTotal === 1 ? 'course' : 'courses'}
          </span>
        </div>
      )}
    </>
  );
};

/** Loading / error / empty / grid states for the course catalog. */
export const CoursesResults = ({
  courses,
  isLoading,
  error,
  filtered,
  advancingId,
  removingId,
  hasNextPage = false,
  isFetchingNextPage = false,
  sentinelRef,
  totalCount,
  onAdvance,
  onEdit,
  onDelete,
  onClearAll,
}: CoursesResultsProps): ReactElement => {
  if (isLoading) {
    return <CardGridSkeleton />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load courses">
        {error.message}
      </Alert>
    );
  }
  if (courses.length === 0) {
    return filtered ? (
      <EmptyState
        title="No courses match"
        description="Try a different search term or clear your filters."
        action={
          <Button variant="outline" onClick={onClearAll}>
            Clear all filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No courses yet"
        description="Courses will appear here once they're published."
      />
    );
  }
  return (
    <>
      <div className={styles.grid}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isBusy={course.id === advancingId || course.id === removingId}
            onAdvance={onAdvance}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <CoursesListFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        count={courses.length}
        totalCount={totalCount}
      />
    </>
  );
};
