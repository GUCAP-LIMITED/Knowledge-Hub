import { useEffect, useMemo, useState } from 'react';
import type { ApprovalStatusCounts, Submission } from '../domain';
import {
  useApproveSubmission,
  useFlagSubmission,
  usePublishSubmission,
  useRejectSubmission,
} from './use-submissions';
import {
  useApprovalStatusCounts,
  useInfiniteSubmissions,
} from './use-infinite-submissions';

const isDecisionTab = (tab: string): boolean => tab === 'pending' || tab === 'review';

const TAB_TO_STATUS: Readonly<Record<string, number>> = {
  pending: 5,
  review: 10,
  approved: 15,
  published: 20,
  rejected: 25,
};

const TYPE_NAME_TO_INT: Readonly<Record<string, number>> = {
  Course: 0,
  Tutorial: 5,
  Resource: 10,
};

const useDebouncedValue = (value: string, delayMs = 300): string => {
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value.trim());
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);
  return debounced;
};

export interface ApprovalActions {
  readonly switchTab: (value: string) => void;
  readonly toggleSelect: (id: string) => void;
  readonly clearSelected: () => void;
  readonly approveSelected: () => void;
  readonly openReview: (submission: Submission) => void;
  readonly closeReview: () => void;
  readonly approveReviewed: (id: string, note: string) => void;
  readonly rejectReviewed: (id: string, reason: string) => void;
  readonly flag: (id: string) => void;
  readonly publish: (id: string) => void;
  readonly clearFilters: () => void;
}

export interface ApprovalQueue extends ApprovalActions {
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly type: string;
  readonly setType: (value: string) => void;
  readonly types: readonly string[];
  readonly filtered: boolean;
  readonly data: readonly Submission[];
  readonly totalCount: number;
  readonly statusCounts: ApprovalStatusCounts | undefined;
  readonly busy: boolean;
  readonly activeTab: string;
  readonly selected: readonly string[];
  readonly selectedInTab: readonly string[];
  readonly selectable: boolean;
  readonly reviewing: Submission | null;
  readonly rejectError: string | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => void;
}

interface Mutations {
  readonly approve: ReturnType<typeof useApproveSubmission>;
  readonly reject: ReturnType<typeof useRejectSubmission>;
  readonly flag: ReturnType<typeof useFlagSubmission>;
  readonly publish: ReturnType<typeof usePublishSubmission>;
}

interface ActionDeps extends Mutations {
  readonly selectedInTab: readonly string[];
  readonly setActiveTab: (value: string) => void;
  readonly setSelected: (updater: (prev: readonly string[]) => readonly string[]) => void;
  readonly clearSelected: () => void;
  readonly closeReview: () => void;
  readonly openReviewId: (id: string) => void;
  readonly clearFilters: () => void;
}

const makeActions = (d: ActionDeps): ApprovalActions => ({
  switchTab: (value) => {
    d.setActiveTab(value);
    d.clearSelected();
  },
  toggleSelect: (id) => {
    d.setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  },
  clearSelected: d.clearSelected,
  approveSelected: () => {
    d.selectedInTab.forEach((id) => {
      d.approve.mutate({ id });
    });
    d.clearSelected();
  },
  openReview: (submission) => {
    d.openReviewId(submission.id);
  },
  closeReview: d.closeReview,
  approveReviewed: (id, note) => {
    d.approve.mutate(note.length > 0 ? { id, note } : { id }, {
      onSuccess: d.closeReview,
    });
  },
  rejectReviewed: (id, reason) => {
    d.reject.mutate({ id, reason }, { onSuccess: d.closeReview });
  },
  flag: (id) => {
    d.flag.mutate(id);
  },
  publish: (id) => {
    d.publish.mutate(id);
  },
  clearFilters: d.clearFilters,
});

const useApprovalMutations = (): Mutations & { readonly busy: boolean } => {
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const flag = useFlagSubmission();
  const publish = usePublishSubmission();
  const busy =
    approve.isPending || reject.isPending || flag.isPending || publish.isPending;
  return { approve, reject, flag, publish, busy };
};

/** All state, derived data and handlers for the approval queue, kept out of the view component. */
export const useApprovalQueue = (): ApprovalQueue => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [type, setType] = useState('all');
  const [selected, setSelected] = useState<readonly string[]>([]);

  const resolvedType = TYPE_NAME_TO_INT[type];
  const filterParams = useMemo(
    () => ({
      filter: debouncedQuery.length > 0 ? debouncedQuery : undefined,
      type: resolvedType,
    }),
    [debouncedQuery, resolvedType],
  );

  const statusCountsQuery = useApprovalStatusCounts(filterParams);
  const submissionsQuery = useInfiniteSubmissions({
    ...filterParams,
    status: TAB_TO_STATUS[activeTab],
  });

  const { approve, reject, flag, publish, busy } = useApprovalMutations();

  const data = useMemo(
    () => submissionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [submissionsQuery.data],
  );

  const totalCount = submissionsQuery.data?.pages[0]?.totalCount ?? 0;
  const reviewing = data.find((s) => s.id === reviewId) ?? null;
  const selectedInTab = selected.filter((id) => data.some((s) => s.id === id));
  const filtered = query.trim() !== '' || type !== 'all';

  const actions = makeActions({
    approve,
    reject,
    flag,
    publish,
    selectedInTab,
    setActiveTab,
    setSelected,
    clearSelected: () => {
      setSelected([]);
    },
    closeReview: () => {
      setReviewId(null);
    },
    openReviewId: setReviewId,
    clearFilters: () => {
      setQuery('');
      setType('all');
      setActiveTab('pending');
    },
  });

  return {
    ...actions,
    query,
    setQuery,
    type,
    setType,
    types: ['Course', 'Tutorial', 'Resource'],
    filtered,
    data,
    totalCount,
    statusCounts: statusCountsQuery.data,
    busy,
    activeTab,
    selected,
    selectedInTab,
    selectable: isDecisionTab(activeTab),
    reviewing,
    rejectError: reject.error?.message,
    isLoading: submissionsQuery.isLoading,
    error: submissionsQuery.isError ? submissionsQuery.error : null,
    hasNextPage: submissionsQuery.hasNextPage,
    isFetchingNextPage: submissionsQuery.isFetchingNextPage,
    fetchNextPage: () => {
      void submissionsQuery.fetchNextPage();
    },
  };
};
