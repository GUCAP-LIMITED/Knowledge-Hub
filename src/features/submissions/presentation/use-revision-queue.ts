import { useEffect, useMemo, useState } from 'react';
import {
  type ContentRevision,
  type RevisionStatusCounts,
  useRevisionStatusCounts,
} from '@features/content';
import { useInfiniteRevisions } from './use-infinite-revisions';

export const REVISION_TABS = [
  { value: 'pending', label: 'Pending', statusInt: 5 },
  { value: 'review', label: 'Under Review', statusInt: 10 },
  { value: 'approved', label: 'Approved', statusInt: 15 },
  { value: 'rejected', label: 'Rejected', statusInt: 25 },
] as const;

export type RevisionTab = (typeof REVISION_TABS)[number]['value'];
export type RevisionTabConfig = (typeof REVISION_TABS)[number];

const DEFAULT_TAB_CONFIG: RevisionTabConfig = REVISION_TABS[0];

const TYPE_NAME_TO_INT: Readonly<Record<string, number>> = {
  Course: 0,
  Tutorial: 5,
  Resource: 10,
};

export const resolveRevisionTabCount = (
  tabVal: RevisionTab,
  counts?: RevisionStatusCounts,
): number => {
  if (!counts) return 0;
  switch (tabVal) {
    case 'pending':
      return counts.pending;
    case 'review':
      return counts.inReview;
    case 'approved':
      return counts.approved;
    case 'rejected':
      return counts.rejected;
  }
};

export interface RevisionQueueState {
  readonly activeTab: RevisionTab;
  readonly setActiveTab: (tab: RevisionTab) => void;
  readonly query: string;
  readonly setQuery: (q: string) => void;
  readonly type: string;
  readonly setType: (t: string) => void;
  readonly filtered: boolean;
  readonly clearFilters: () => void;
  readonly items: readonly ContentRevision[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => void;
  readonly tabs: readonly { readonly value: string; readonly label: string }[];
  readonly currentTabConfig: RevisionTabConfig;
}

export const useRevisionQueue = (): RevisionQueueState => {
  const [activeTab, setActiveTab] = useState<RevisionTab>('pending');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const resolvedType = TYPE_NAME_TO_INT[type];
  const filterParams = useMemo(
    () => ({
      filter: debouncedQuery.length > 0 ? debouncedQuery : undefined,
      type: resolvedType,
    }),
    [debouncedQuery, resolvedType],
  );

  const statusCountsQuery = useRevisionStatusCounts(filterParams);
  const currentTabConfig =
    REVISION_TABS.find((t) => t.value === activeTab) ?? DEFAULT_TAB_CONFIG;

  const revisionsQuery = useInfiniteRevisions({
    ...filterParams,
    status: currentTabConfig.statusInt,
  });

  const items = useMemo(
    () => revisionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [revisionsQuery.data],
  );

  const tabs = useMemo(
    () =>
      REVISION_TABS.map((t) => ({
        value: t.value,
        label: `${t.label} (${String(resolveRevisionTabCount(t.value, statusCountsQuery.data))})`,
      })),
    [statusCountsQuery.data],
  );

  const filtered = query.trim() !== '' || type !== 'all';
  const clearFilters = (): void => {
    setQuery('');
    setType('all');
    setActiveTab('pending');
  };

  return {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    type,
    setType,
    filtered,
    clearFilters,
    items,
    isLoading: revisionsQuery.isLoading,
    error: revisionsQuery.error,
    hasNextPage: revisionsQuery.hasNextPage,
    isFetchingNextPage: revisionsQuery.isFetchingNextPage,
    fetchNextPage: () => {
      void revisionsQuery.fetchNextPage();
    },
    tabs,
    currentTabConfig,
  };
};
