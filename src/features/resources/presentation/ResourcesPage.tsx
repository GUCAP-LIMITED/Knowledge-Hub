import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { FolderOpen } from 'lucide-react';
import { CatalogCounterRow, PageHeader, useDeleteConfirm } from '@shared/ui';
import { useContentCategories } from '@features/content';
import type { Resource, ResourceCatalogParams } from '../domain';
import {
  useDeleteResource,
  useInfiniteResources,
  useUpdateResource,
} from './use-resources';
import { ResourcesResults } from './ResourcesResults';
import { ResourceEditModal } from './ResourceEditModal';
import { ResourcesToolbar } from './ResourcesToolbar';
import styles from './ResourcesPage.module.css';

interface ResourceParamsInput {
  readonly query: string;
  readonly categoryId: string | undefined;
}

const buildResourceParams = (
  input: ResourceParamsInput,
): Omit<ResourceCatalogParams, 'skipCount'> => ({
  filter: input.query.trim() !== '' ? input.query.trim() : undefined,
  categoryId: input.categoryId,
  maxResultCount: 12,
});

/** Routed knowledge-base catalog page: search, category filter, and an infinite-scroll grid. */
// eslint-disable-next-line max-lines-per-function
export const ResourcesPage = (): ReactElement => {
  const update = useUpdateResource();
  const remove = useDeleteResource();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<Resource | null>(null);
  const categoriesQuery = useContentCategories('resource');
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
      buildResourceParams({
        query: debouncedQuery,
        categoryId,
      }),
    [debouncedQuery, categoryId],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteResources(queryParams);

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

  const del = useDeleteConfirm(visible, 'resource', handleDelete, remove.isPending);

  const filtered = query.trim() !== '' || categoryId !== undefined;

  const handleClearAll = useCallback((): void => {
    setQuery('');
    setDebouncedQuery('');
    setCategoryId(undefined);
  }, []);

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Resources"
        subtitle="Knowledge base, policies, guides, documents, and reference materials."
      />

      <CatalogCounterRow
        count={totalCount}
        isLoading={isLoading}
        filtered={filtered}
        singular="resource"
        plural="resources"
        icon={FolderOpen}
      />

      <ResourcesToolbar
        query={query}
        categoryId={categoryId}
        categories={categories}
        onQuery={setQuery}
        onCategory={setCategoryId}
        onClearAll={handleClearAll}
      />

      <ResourcesResults
        resources={visible}
        isLoading={isLoading}
        error={isError ? error : null}
        filtered={filtered}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        totalCount={totalCount}
        removingId={remove.isPending ? remove.variables : null}
        onEdit={setEditing}
        onDelete={del.request}
        onClearAll={handleClearAll}
      />

      <ResourceEditModal
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
