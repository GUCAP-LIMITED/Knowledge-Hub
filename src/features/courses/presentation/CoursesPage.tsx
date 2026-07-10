import { useMemo, useState, type ReactElement } from 'react';
import {
  DetailsEditModal,
  type EditDraft,
  type EditFieldConfig,
  PageHeader,
} from '@shared/ui';
import { useAuth } from '@features/auth';
import { useContentTypes } from '@features/content-types';
import type { Course } from '../domain';
import {
  useCourses,
  useDeleteCourse,
  useUpdateCourse,
  useUpdateCourseProgress,
} from './use-courses';
import { CoursesResults } from './CoursesResults';
import {
  CoursesToolbar,
  type CourseSort,
  type CourseStatusFilter,
  type CourseTypeFilter,
} from './CoursesToolbar';
import styles from './CoursesPage.module.css';

const nextProgress = (course: Course): number =>
  course.hasStarted() ? Math.min(100, course.progress + 10) : 5;

const courseFields = (
  course: Course,
  categories: readonly string[],
): readonly EditFieldConfig[] => [
  { name: 'title', label: 'Title', kind: 'text', initial: course.title },
  {
    name: 'category',
    label: 'Category',
    kind: 'select',
    initial: course.category,
    options: categories,
  },
  { name: 'duration', label: 'Duration', kind: 'text', initial: course.duration },
  {
    name: 'mandatory',
    label: 'Requirement',
    kind: 'select',
    initial: course.mandatory ? 'Mandatory' : 'Optional',
    options: ['Mandatory', 'Optional'],
  },
];

const toCourseUpdate = (
  id: string,
  draft: EditDraft,
): {
  id: string;
  title: string;
  category: string;
  duration: string;
  mandatory: boolean;
} => ({
  id,
  title: draft.title ?? '',
  category: draft.category ?? '',
  duration: draft.duration ?? '',
  mandatory: draft.mandatory === 'Mandatory',
});

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
  const { user } = useAuth();
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;
  const courses = useCourses();
  const updateProgress = useUpdateCourseProgress();
  const update = useUpdateCourse();
  const remove = useDeleteCourse();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<CourseStatusFilter>('all');
  const [type, setType] = useState<CourseTypeFilter>('all');
  const [sort, setSort] = useState<CourseSort>('popular');
  const [editing, setEditing] = useState<Course | null>(null);
  const courseTypes = useContentTypes('course');

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

      <CoursesResults
        courses={visible}
        isLoading={courses.isLoading}
        error={courses.isError ? courses.error : null}
        isAdmin={isAdmin}
        advancingId={updateProgress.isPending ? updateProgress.variables.id : null}
        removingId={remove.isPending ? remove.variables : null}
        onAdvance={handleAdvance}
        onEdit={setEditing}
        onDelete={(id) => {
          remove.mutate(id);
        }}
      />

      <DetailsEditModal
        item={editing === null ? null : { id: editing.id }}
        heading="Edit course"
        fields={editing === null ? [] : courseFields(editing, courseTypes)}
        isSubmitting={update.isPending}
        onClose={() => {
          setEditing(null);
        }}
        onSave={(id, draft) => {
          update.mutate(toCourseUpdate(id, draft), {
            onSuccess: () => {
              setEditing(null);
            },
          });
        }}
      />
    </section>
  );
};
