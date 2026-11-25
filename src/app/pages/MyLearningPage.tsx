import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactElement,
} from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@shared/ui';
import {
  useInfiniteMyLearning,
  useMyLearningStats,
  useMyLearningStatuses,
  MyLearningToolbar,
  mapOriginParam,
  mapAssignedScopeParam,
  type MyLearningQueryParams,
} from '@features/my-learning';
import { MyLearningContent } from './MyLearningContent';
import styles from './MyLearningPage.module.css';

const isForbiddenError = (err: unknown): boolean => {
  if (err instanceof Error) {
    const lower = err.message.toLowerCase();
    return (
      lower.includes('403') ||
      lower.includes('forbidden') ||
      lower.includes('unauthorized') ||
      lower.includes('access denied')
    );
  }
  return false;
};

const shouldRedirectToForbidden = (
  isError: boolean,
  error: unknown,
  statsIsError: boolean,
  statsError: unknown,
): boolean =>
  (isError && isForbiddenError(error)) || (statsIsError && isForbiddenError(statsError));

// eslint-disable-next-line max-lines-per-function
export const MyLearningPage = (): ReactElement => {
  const { statuses } = useMyLearningStatuses();
  const overdueStatusValue = useMemo(
    () =>
      statuses.find((s) => s.name.toLowerCase() === 'overdue')?.value.toString() ?? '3',
    [statuses],
  );

  const [searchParams] = useSearchParams();
  const initialOrigin = searchParams.get('origin');
  const initialStatus =
    searchParams.get('status') ??
    (searchParams.get('tab') === 'overdue' ? overdueStatusValue : 'all');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [origin, setOrigin] = useState<'all' | 'self' | 'assigned'>(
    initialOrigin === 'assigned' ||
      initialStatus === overdueStatusValue ||
      initialStatus === '3'
      ? 'assigned'
      : initialOrigin === 'self'
        ? 'self'
        : 'all',
  );
  const [assignedScope, setAssignedScope] = useState<'all' | 'me' | 'team' | 'role'>(
    'all',
  );
  const [contentType, setContentType] = useState<string>('all');
  const [status, setStatus] = useState<string>(initialStatus);
  const [sorting, setSorting] = useState<string>('EnrolledOrAssignedAt DESC');

  useEffect(() => {
    const urlOrigin = searchParams.get('origin');
    const urlStatus = searchParams.get('status');
    const urlTab = searchParams.get('tab');

    if (urlStatus === overdueStatusValue || urlStatus === '3' || urlTab === 'overdue') {
      setOrigin('assigned');
      setStatus(overdueStatusValue);
    } else if (urlOrigin === 'assigned' || urlOrigin === 'self' || urlOrigin === 'all') {
      setOrigin(urlOrigin);
      if (urlStatus) {
        setStatus(urlStatus);
      }
    }
  }, [searchParams, overdueStatusValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleOriginChange = useCallback(
    (newOrigin: 'all' | 'self' | 'assigned') => {
      setOrigin(newOrigin);
      if (newOrigin !== 'assigned') {
        setAssignedScope('all');
        if (status === overdueStatusValue || status === '3') {
          setStatus('all');
        }
      }
      if (newOrigin !== 'assigned' && sorting.startsWith('DueDate')) {
        setSorting('EnrolledOrAssignedAt DESC');
      }
    },
    [overdueStatusValue, sorting, status],
  );

  const handleClearAll = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setOrigin('all');
    setAssignedScope('all');
    setContentType('all');
    setStatus('all');
    setSorting('EnrolledOrAssignedAt DESC');
  }, []);

  const originParam = useMemo(() => mapOriginParam(origin), [origin]);
  const assignedScopeParam = useMemo(
    () => mapAssignedScopeParam(origin, assignedScope),
    [origin, assignedScope],
  );
  const contentTypeParam = useMemo(
    () => (contentType !== 'all' ? Number(contentType) : undefined),
    [contentType],
  );
  const statusParam = useMemo(
    () => (status !== 'all' ? Number(status) : undefined),
    [status],
  );

  const queryParams: Omit<MyLearningQueryParams, 'skipCount'> = useMemo(
    () => ({
      filter: debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined,
      origin: originParam,
      assignedScope: assignedScopeParam,
      contentType: contentTypeParam,
      status: statusParam,
      sorting,
      maxResultCount: 12,
    }),
    [
      debouncedSearch,
      originParam,
      assignedScopeParam,
      contentTypeParam,
      statusParam,
      sorting,
    ],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteMyLearning(queryParams);

  const statsQuery = useMyLearningStats();
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

  const allItems = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const hasActiveFilters =
    search.trim() !== '' || origin !== 'all' || contentType !== 'all' || status !== 'all';

  if (shouldRedirectToForbidden(isError, error, statsQuery.isError, statsQuery.error)) {
    return <Navigate to="/forbidden" replace />;
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="My Learning"
        subtitle="Track your assigned training, enrolled courses, and completed materials in one place"
      />

      <MyLearningToolbar
        search={search}
        onSearchChange={setSearch}
        origin={origin}
        onOriginChange={handleOriginChange}
        assignedScope={assignedScope}
        onAssignedScopeChange={setAssignedScope}
        contentType={contentType}
        onContentTypeChange={setContentType}
        status={status}
        onStatusChange={setStatus}
        statuses={statuses}
        sorting={sorting}
        onSortingChange={setSorting}
        stats={statsQuery.data}
        onClearAll={handleClearAll}
      />

      <MyLearningContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={() => {
          void refetch();
        }}
        items={allItems}
        hasActiveFilters={hasActiveFilters}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        onClearAll={handleClearAll}
      />
    </section>
  );
};
