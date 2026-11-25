import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { CatalogCounterRow, PageHeader, useDeleteConfirm } from '@shared/ui';
import { useContentCategories } from '@features/content';
import type { Tutorial, TutorialCatalogParams } from '../domain';
import {
  useDeleteTutorial,
  useInfiniteTutorials,
  useUpdateTutorial,
} from './use-tutorials';
import { TutorialsResults } from './TutorialsResults';
import { TutorialEditModal } from './TutorialEditModal';
import { TutorialsToolbar } from './TutorialsToolbar';
import type { TutorialSort } from './tutorials-filter';
import styles from './TutorialsPage.module.css';

interface TutorialParamsInput {
  readonly query: string;
  readonly categoryId: string | undefined;
  readonly sort: TutorialSort;
}

const buildTutorialParams = (
  input: TutorialParamsInput,
): Omit<TutorialCatalogParams, 'skipCount'> => ({
  filter: input.query.trim() !== '' ? input.query.trim() : undefined,
  categoryId: input.categoryId,
  sorting: input.sort,
  maxResultCount: 12,
});

/** Routed tutorials-library page: category filter, search, admin edit/delete. */
// eslint-disable-next-line max-lines-per-function
export const TutorialsPage = (): ReactElement => {
  const navigate = useNavigate();
  const update = useUpdateTutorial();
  const remove = useDeleteTutorial();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<TutorialSort>('recent');
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const categoriesQuery = useContentCategories('tutorial');
  const categories = categoriesQuery.data ?? [];

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
      buildTutorialParams({
        query: debouncedQuery,
        categoryId,
        sort,
      }),
    [debouncedQuery, categoryId, sort],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteTutorials(queryParams);

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

  const handleDelete = useCallback(
    (id: string) => {
      remove.mutate(id);
    },
    [remove],
  );

  const del = useDeleteConfirm(visible, 'tutorial', handleDelete, remove.isPending);

  const filtered = query.trim() !== '' || categoryId !== undefined;

  const handleClearAll = useCallback((): void => {
    setQuery('');
    setDebouncedQuery('');
    setCategoryId(undefined);
  }, []);

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Tutorials"
        subtitle="Short, focused how-to guides for everyday tasks."
      />

      <CatalogCounterRow
        count={totalCount}
        isLoading={isLoading}
        filtered={filtered}
        singular="tutorial"
        plural="tutorials"
        icon={Lightbulb}
      />

      <TutorialsToolbar
        query={query}
        categoryId={categoryId}
        categories={categories}
        sort={sort}
        onQuery={setQuery}
        onCategory={setCategoryId}
        onSort={setSort}
        onClearAll={handleClearAll}
      />

      <TutorialsResults
        tutorials={visible}
        isLoading={isLoading}
        error={isError ? error : null}
        filtered={filtered}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        totalCount={totalCount}
        removingId={remove.isPending ? remove.variables : null}
        onWatch={(tutorial) => {
          navigate(`/tutorials/${tutorial.slug || tutorial.id}`);
        }}
        onEdit={setEditing}
        onDelete={del.request}
        onClearAll={handleClearAll}
      />

      <TutorialEditModal
        editing={editing}
        categories={categories}
        update={update}
        onClose={() => {
          setEditing(null);
        }}
      />

      {del.dialog}
    </section>
  );
};
