import type { ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import type { Course } from '../domain';
import { useCourses, useUpdateCourseProgress } from './use-courses';
import { CourseCard } from './CourseCard';
import styles from './CoursesPage.module.css';

const nextProgress = (course: Course): number => {
  if (!course.hasStarted()) {
    return 5;
  }
  return Math.min(100, course.progress + 10);
};

/** Routed course-catalog page. Reads server state via TanStack Query; no business logic here. */
export const CoursesPage = (): ReactElement => {
  const courses = useCourses();
  const updateProgress = useUpdateCourseProgress();

  const handleAdvance = (course: Course): void => {
    updateProgress.mutate({ id: course.id, progress: nextProgress(course) });
  };

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Course Catalog</h1>
          <p className={styles.subtitle}>Structured, multi-lesson learning paths.</p>
        </div>
      </header>

      {courses.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading courses" />
        </div>
      ) : null}

      {courses.isError ? (
        <Alert tone="error" title="Could not load courses">
          {courses.error.message}
        </Alert>
      ) : null}

      {courses.data?.length === 0 ? (
        <p className={styles.empty}>No courses yet.</p>
      ) : null}

      {courses.data !== undefined && courses.data.length > 0 ? (
        <div className={styles.grid}>
          {courses.data.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isBusy={updateProgress.isPending}
              onAdvance={handleAdvance}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
