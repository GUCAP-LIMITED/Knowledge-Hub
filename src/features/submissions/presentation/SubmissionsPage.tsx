import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { CheckCircle } from 'lucide-react';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { Alert, Button, EmptyState, TableSkeleton } from '@shared/ui';
import { useAuth } from '@features/auth';
import { useMyPermissions } from '@features/permissions';
import { CONTENT_STATUS, CONTENT_TYPE, useContentCategories } from '@features/content';
import type {
  PagedSubmissionsResult,
  Submission,
  SubmissionQueryParams,
} from '../domain';
import { SubmissionsTable } from './SubmissionsTable';
import { usePublishesDirectly } from './use-publishes-directly';
import { useMySubmissions } from './use-submissions';
import { useInfiniteSubmissions } from './use-infinite-submissions';
import {
  SubmissionsToolbar,
  type SubmissionSortFilter,
  type SubmissionStatusFilter,
  type SubmissionsToolbarProps,
  type SubmissionTypeFilter,
} from './SubmissionsToolbar';
import { defaultStatus } from './submissions-filter';
import { SubmissionsPageHeader } from './SubmissionsPageHeader';
import { SubmissionsListFooter } from './SubmissionsListFooter';
import styles from './SubmissionsPage.module.css';

const SORTING: Readonly<Record<SubmissionSortFilter, string>> = {
  newest: 'CreationTime desc',
  oldest: 'CreationTime asc',
};

interface FilterState {
  readonly query: string;
  readonly type: SubmissionTypeFilter;
  readonly status: SubmissionStatusFilter;
  readonly categoryId: string;
  readonly sorting: SubmissionSortFilter;
}

const buildFilterParams = (
  state: FilterState,
): Omit<SubmissionQueryParams, 'skipCount' | 'maxResultCount'> => ({
  filter: state.query.trim() !== '' ? state.query.trim() : undefined,
  type: state.type === 'all' ? undefined : CONTENT_TYPE[state.type],
  status: state.status === 'all' ? undefined : CONTENT_STATUS[state.status],
  categoryId: state.categoryId === 'all' ? undefined : state.categoryId,
  sorting: SORTING[state.sorting],
});

const SubmissionsBody = ({
  isLoading,
  error,
  data,
  isAdmin,
  filtered,
  onClearAll,
}: {
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly data: readonly Submission[];
  readonly isAdmin: boolean;
  readonly filtered: boolean;
  readonly onClearAll: () => void;
}): ReactElement => {
  if (isLoading) {
    return <TableSkeleton columns={4} />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load submissions">
        {error.message}
      </Alert>
    );
  }
  if (data.length === 0) {
    if (filtered) {
      return (
        <EmptyState
          title="No documents match"
          description="Try a different search term or clear your filters."
          action={
            <Button variant="outline" onClick={onClearAll}>
              Clear all filters
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        title={isAdmin ? 'No published documents' : 'No submissions yet'}
        description={
          isAdmin
            ? 'Published documents will appear here.'
            : 'Documents you upload will appear here while they are reviewed.'
        }
      />
    );
  }
  return <SubmissionsTable submissions={data} />;
};

const isFiltered = (state: FilterState, isAdmin: boolean): boolean =>
  state.query.trim() !== '' ||
  state.type !== 'all' ||
  state.status !== defaultStatus(isAdmin) ||
  state.categoryId !== 'all';

interface SubmissionsFilters extends SubmissionsToolbarProps {
  readonly params: Omit<SubmissionQueryParams, 'skipCount' | 'maxResultCount'>;
  readonly filtered: boolean;
}

/** Filter-box state + debouncing + the derived query params, kept out of the view component. */
const useSubmissionsFilters = (isAdmin: boolean): SubmissionsFilters => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<SubmissionTypeFilter>('all');
  const [status, setStatus] = useState<SubmissionStatusFilter>(() =>
    defaultStatus(isAdmin),
  );
  const [categoryId, setCategoryId] = useState('all');
  const [sorting, setSorting] = useState<SubmissionSortFilter>('newest');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const categories = useContentCategories(type === 'all' ? 'course' : type, {
    enabled: type !== 'all',
  });

  const params = useMemo(
    () => buildFilterParams({ query: debouncedQuery, type, status, categoryId, sorting }),
    [debouncedQuery, type, status, categoryId, sorting],
  );
  const filtered = isFiltered(
    { query: debouncedQuery, type, status, categoryId, sorting },
    isAdmin,
  );

  return {
    query,
    onQuery: setQuery,
    type,
    onType: (value) => {
      setType(value);
      setCategoryId('all');
    },
    status,
    onStatus: setStatus,
    categoryId,
    onCategory: setCategoryId,
    categories: categories.data ?? [],
    sorting,
    onSorting: setSorting,
    isAdmin,
    onClearAll: () => {
      setQuery('');
      setDebouncedQuery('');
      setType('all');
      setStatus(defaultStatus(isAdmin));
      setCategoryId('all');
    },
    params,
    filtered,
  };
};

interface SubmissionsView {
  readonly data: readonly Submission[];
  readonly totalCount: number;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
}

/**
 * Admins page through the filtered queue server-side; a learner's own submissions stay a single
 * bounded fetch — the Content API has no server-side "owner" filter to paginate by.
 */
const resolveSubmissionsView = (
  isAdmin: boolean,
  all: UseInfiniteQueryResult<InfiniteData<PagedSubmissionsResult>>,
  mine: UseQueryResult<readonly Submission[]>,
): SubmissionsView => {
  if (isAdmin) {
    return {
      data: all.data?.pages.flatMap((page) => page.items) ?? [],
      totalCount: all.data?.pages[0]?.totalCount ?? 0,
      isLoading: all.isLoading,
      error: all.isError ? all.error : null,
      hasNextPage: all.hasNextPage,
      isFetchingNextPage: all.isFetchingNextPage,
    };
  }
  return {
    data: mine.data ?? [],
    totalCount: mine.data?.length ?? 0,
    isLoading: mine.isLoading,
    error: mine.isError ? mine.error : null,
    hasNextPage: false,
    isFetchingNextPage: false,
  };
};

/** "My Submissions": authors track their review status; admins page through all published content. */
export const SubmissionsPage = (): ReactElement => {
  const { user } = useAuth();
  const publishesDirectly = usePublishesDirectly();
  const { data: permissions } = useMyPermissions();
  const isAdmin = permissions?.['Submissions.View'] === true;
  const canUpload = permissions?.['Submissions.Create'] === true;
  const { params, filtered, ...toolbarProps } = useSubmissionsFilters(isAdmin);

  const all = useInfiniteSubmissions(params, { enabled: isAdmin });
  // Identity is the owner GUID — the Content API scopes/labels submissions by user id, not name.
  const mine = useMySubmissions(user?.id ?? '', params, { enabled: !isAdmin });

  const { data, totalCount, isLoading, error, hasNextPage, isFetchingNextPage } = useMemo(
    () => resolveSubmissionsView(isAdmin, all, mine),
    [isAdmin, all, mine],
  );
  const { fetchNextPage } = all;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className={styles.screen}>
      <SubmissionsPageHeader isAdmin={isAdmin} canUpload={canUpload} />

      {publishesDirectly ? (
        <div className={styles.adminNote}>
          <CheckCircle size={18} aria-hidden="true" />
          <span>Your uploads are published directly without review.</span>
        </div>
      ) : null}

      <SubmissionsToolbar {...toolbarProps} />

      <SubmissionsBody
        isLoading={isLoading}
        error={error}
        data={data}
        isAdmin={isAdmin}
        filtered={filtered}
        onClearAll={toolbarProps.onClearAll}
      />

      {isAdmin && !isLoading && error === null && data.length > 0 ? (
        <SubmissionsListFooter
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={sentinelRef}
          count={data.length}
          totalCount={totalCount}
        />
      ) : null}
    </section>
  );
};
