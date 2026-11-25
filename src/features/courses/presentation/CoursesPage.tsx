import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, PageHeader, useDeleteConfirm } from '@shared/ui';
import type { Course, CourseCatalogParams } from '../domain';
import { useContentCategories } from '@features/content';
import { CourseEditModal } from './CourseEditModal';
import { CoursesCounterRow } from './components/CoursesCounterRow';
import {
  useInfiniteCourses,
  useDeleteCourse,
  useUpdateCourse,
  useUpdateCourseProgress,
  useEnrollCourse,
} from './use-courses';
import { useEnrollmentStatuses } from './use-enrollment-statuses';
import { CoursesResults } from './CoursesResults';
import { CoursesToolbar, type CourseSort } from './CoursesToolbar';
import styles from './CoursesPage.module.css';

const nextProgress = (course: Course): number =>
  course.hasStarted() ? Math.min(100, course.progress + 10) : 5;

interface CatalogParamsInput {
  readonly query: string;
  readonly categoryId: string | undefined;
  readonly status: number | undefined;
  readonly sort: CourseSort;
}

const buildCatalogParams = (
  input: CatalogParamsInput,
): Omit<CourseCatalogParams, 'skipCount'> => ({
  filter: input.query.trim() !== '' ? input.query.trim() : undefined,
  categoryId: input.categoryId,
  status: input.status,
  sorting: input.sort,
  maxResultCount: 12,
});

const getAdvancingId = (
  isProgressPending: boolean,
  progressId?: string,
  isEnrollPending?: boolean,
  enrollId?: string,
): string | null => {
  if (isProgressPending && progressId) return progressId;
  if (isEnrollPending && enrollId) return enrollId;
  return null;
};

const isFromDashboardAction = (state: unknown): boolean =>
  Boolean((state as { fromDashboardAction?: boolean } | null)?.fromDashboardAction);

const isFilterActive = (query: string, categoryId?: string, status?: number): boolean =>
  query.trim() !== '' || categoryId !== undefined || status !== undefined;

/** Routed course-catalog page with search, category/status filters and sort. */
// eslint-disable-next-line max-lines-per-function
export const CoursesPage = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromDashboard = isFromDashboardAction(location.state);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<CourseSort>('popular');
  const [editing, setEditing] = useState<Course | null>(null);
  const categoriesQuery = useContentCategories('course');
  const categories = categoriesQuery.data ?? [];
  const statusesQuery = useEnrollmentStatuses();
  const statuses = statusesQuery.data ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const queryParams = useMemo(
    () =>
      buildCatalogParams({
        query: debouncedQuery,
        categoryId,
        status,
        sort,
      }),
    [debouncedQuery, categoryId, status, sort],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteCourses(queryParams);

  const updateProgress = useUpdateCourseProgress();
  const enroll = useEnrollCourse();
  const update = useUpdateCourse();
  const remove = useDeleteCourse();

  const visible = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const del = useDeleteConfirm(visible, 'course', remove.mutate, remove.isPending);

  const filtered = isFilterActive(query, categoryId, status);

  const handleClearAll = useCallback((): void => {
    setQuery('');
    setDebouncedQuery('');
    setCategoryId(undefined);
    setStatus(undefined);
  }, []);

  const handleAdvance = useCallback(
    (course: Course): void => {
      if (!course.isEnrolled) enroll.mutate(course.id);
      else updateProgress.mutate({ id: course.id, progress: nextProgress(course) });
    },
    [enroll, updateProgress],
  );

  const advancingId = getAdvancingId(
    updateProgress.isPending,
    updateProgress.variables?.id,
    enroll.isPending,
    enroll.variables,
  );

  return (
    <section className={styles.screen}>
      <PageHeader title="Course Catalog" subtitle="Find what you need to learn next.">
        {isFromDashboard ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate('/dashboard');
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
          </Button>
        ) : null}
      </PageHeader>

      <CoursesCounterRow count={totalCount} isLoading={isLoading} filtered={filtered} />

      <CoursesToolbar
        query={query}
        categoryId={categoryId}
        categories={categories}
        status={status}
        statuses={statuses}
        sort={sort}
        onQuery={setQuery}
        onCategory={setCategoryId}
        onStatus={setStatus}
        onSort={setSort}
        onClearAll={handleClearAll}
      />

      <CoursesResults
        courses={visible}
        isLoading={isLoading}
        error={isError ? error : null}
        filtered={filtered}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        totalCount={totalCount}
        advancingId={advancingId}
        removingId={remove.isPending ? remove.variables : null}
        onAdvance={handleAdvance}
        onEdit={setEditing}
        onDelete={del.request}
        onClearAll={handleClearAll}
      />

      <CourseEditModal
        editing={editing}
        update={update}
        onClose={() => {
          setEditing(null);
        }}
      />
      {del.dialog}
    </section>
  );
};
