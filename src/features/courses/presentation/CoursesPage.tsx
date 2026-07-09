import { useMemo, useState, type ReactElement } from 'react';
import { Alert, EmptyState, PageHeader, Spinner } from '@shared/ui';
import type { Course } from '../domain';
import { useCourses, useUpdateCourseProgress } from './use-courses';
import { CourseCard } from './CourseCard';
import {
  CoursesToolbar,
  type CourseSort,
  type CourseStatusFilter,
  type CourseTypeFilter,
} from './CoursesToolbar';
import styles from './CoursesPage.module.css';

const nextProgress = (course: Course): number =>
  course.hasStarted() ? Math.min(100, course.progress + 10) : 5;

const matchesStatus = (course: Course, status: CourseStatusFilter): boolean => {
  if (status === 'completed') {
    return course.isCompleted();
  }
  if (status === 'in-progress') {
    return course.hasStarted() && !course.isCompleted();
  }
  if (status === 'not-started') {
    return !course.hasStarted();
  }
  return true;
};

const matchesType = (course: Course, type: CourseTypeFilter): boolean => {
  if (type === 'mandatory') {
    return course.mandatory;
  }
  if (type === 'optional') {
    return !course.mandatory;
  }
  return true;
};

const sortCourses = (courses: readonly Course[], sort: CourseSort): readonly Course[] => {
  const copy = [...courses];
  if (sort === 'popular') {
    return copy.sort((a, b) => b.enrolled - a.enrolled);
  }
  if (sort === 'rating') {
    return copy.sort((a, b) => b.rating - a.rating);
  }
  if (sort === 'duration') {
    return copy.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
  }
  return copy.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
};

/** Routed course-catalog page with search, category/status/type filters and sort. */
export const CoursesPage = (): ReactElement => {
  const courses = useCourses();
  const updateProgress = useUpdateCourseProgress();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<CourseStatusFilter>('all');
  const [type, setType] = useState<CourseTypeFilter>('all');
  const [sort, setSort] = useState<CourseSort>('popular');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (courses.data ?? []).filter(
      (course) =>
        (category === 'all' || course.category === category) &&
        matchesStatus(course, status) &&
        matchesType(course, type) &&
        (q === '' ||
          course.title.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q)),
    );
    return sortCourses(filtered, sort);
  }, [courses.data, query, category, status, type, sort]);

  const handleAdvance = (course: Course): void => {
    updateProgress.mutate({ id: course.id, progress: nextProgress(course) });
  };

  return (
    <section className={styles.screen}>
      <PageHeader title="Course Catalog" subtitle="Find what you need to learn next." />

      <CoursesToolbar
        query={query}
        category={category}
        status={status}
        type={type}
        sort={sort}
        onQuery={setQuery}
        onCategory={setCategory}
        onStatus={setStatus}
        onType={setType}
        onSort={setSort}
      />

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
          description="Try a different search or filters."
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
