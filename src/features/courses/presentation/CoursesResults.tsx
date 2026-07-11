import type { ReactElement } from 'react';
import { Alert, EmptyState, Spinner } from '@shared/ui';
import type { Course } from '../domain';
import { CourseCard } from './CourseCard';
import styles from './CoursesPage.module.css';

export interface CoursesResultsProps {
  readonly courses: readonly Course[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly advancingId: string | null;
  readonly removingId: string | null;
  readonly onAdvance: (course: Course) => void;
  readonly onEdit: (course: Course) => void;
  readonly onDelete: (id: string) => void;
}

/** Loading / error / empty / grid states for the course catalog. */
export const CoursesResults = ({
  courses,
  isLoading,
  error,
  advancingId,
  removingId,
  onAdvance,
  onEdit,
  onDelete,
}: CoursesResultsProps): ReactElement => {
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading courses" />
      </div>
    );
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load courses">
        {error.message}
      </Alert>
    );
  }
  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses match"
        description="Try a different search or filters."
      />
    );
  }
  return (
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
  );
};
