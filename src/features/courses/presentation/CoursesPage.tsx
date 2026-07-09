import { useMemo, useState, type ReactElement } from 'react';
import { Alert, EmptyState, PageHeader, Spinner } from '@shared/ui';
import type { Course } from '../domain';
import { useCourses, useUpdateCourseProgress } from './use-courses';
import { CourseCard } from './CourseCard';
import { CoursesToolbar, type CourseSort } from './CoursesToolbar';
import styles from './CoursesPage.module.css';

const nextProgress = (course: Course): number =>
  course.hasStarted() ? Math.min(100, course.progress + 10) : 5;

const sortCourses = (courses: readonly Course[], sort: CourseSort): readonly Course[] => {
  const copy = [...courses];
  if (sort === 'title') {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === 'rating') {
    return copy.sort((a, b) => b.rating - a.rating);
  }
  return copy.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
};

/** Routed course-catalog page with search, filter and sort. */
export const CoursesPage = (): ReactElement => {
  const courses = useCourses();
  const updateProgress = useUpdateCourseProgress();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<CourseSort>('newest');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (courses.data ?? []).filter(
      (course) =>
        (category === 'all' || course.category === category) &&
        (q === '' || course.title.toLowerCase().includes(q)),
    );
    return sortCourses(filtered, sort);
  }, [courses.data, query, category, sort]);

  const handleAdvance = (course: Course): void => {
    updateProgress.mutate({ id: course.id, progress: nextProgress(course) });
  };

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Course Catalog"
        subtitle="Structured, multi-lesson learning paths."
      />

      <div className={styles.toolbar}>
        <CoursesToolbar
          query={query}
          category={category}
          sort={sort}
          onQuery={setQuery}
          onCategory={setCategory}
          onSort={setSort}
        />
      </div>

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

      {!courses.isLoading && !courses.isError && visible.length === 0 ? (
        <EmptyState
          title="No courses match"
          description="Try a different search or category."
        />
      ) : null}

      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((course) => (
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
