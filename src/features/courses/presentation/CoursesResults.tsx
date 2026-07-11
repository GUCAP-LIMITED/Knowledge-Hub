import type { ReactElement } from 'react';
import { SearchX } from 'lucide-react';
import { Alert, CardGridSkeleton, EmptyState } from '@shared/ui';
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
  readonly onAdvance: (course: Course) => void;
  readonly onEdit: (course: Course) => void;
  readonly onDelete: (id: string) => void;
}

/** Loading / error / empty / grid states for the course catalog. */
export const CoursesResults = ({
  courses,
  isLoading,
  error,
  filtered,
  advancingId,
  removingId,
  onAdvance,
  onEdit,
  onDelete,
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
        icon={SearchX}
        title="No courses match"
        description="Try a different search term or clear your filters."
      />
    ) : (
      <EmptyState
        title="No courses yet"
        description="Courses will appear here once they're published."
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
