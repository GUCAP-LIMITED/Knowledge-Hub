import { useMemo, useState } from 'react';
import type { Submission } from '../domain';
import { filterSubmissions, submissionTypes } from './approvals-filter';
import {
  useApproveSubmission,
  useFlagSubmission,
  usePublishSubmission,
  useRejectSubmission,
  useSubmissions,
} from './use-submissions';

const isDecisionTab = (tab: string): boolean => tab === 'pending' || tab === 'review';

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
}

export interface ApprovalQueue extends ApprovalActions {
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly type: string;
  readonly setType: (value: string) => void;
  readonly types: readonly string[];
  readonly data: readonly Submission[];
  readonly busy: boolean;
  readonly activeTab: string;
  readonly selected: readonly string[];
  readonly selectedInTab: readonly string[];
  readonly selectable: boolean;
  readonly reviewing: Submission | null;
  readonly rejectError: string | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
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
});

/** All state, derived data and handlers for the approval queue, kept out of the view component. */
export const useApprovalQueue = (): ApprovalQueue => {
  const submissions = useSubmissions();
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const flag = useFlagSubmission();
  const publish = usePublishSubmission();

  const [activeTab, setActiveTab] = useState<string>('pending');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [selected, setSelected] = useState<readonly string[]>([]);

  const busy =
    approve.isPending || reject.isPending || flag.isPending || publish.isPending;
  const data = useMemo(
    () => filterSubmissions(submissions.data ?? [], query, type),
    [submissions.data, query, type],
  );
  const types = useMemo(
    () => submissionTypes(submissions.data ?? []),
    [submissions.data],
  );
  const reviewing = data.find((s) => s.id === reviewId) ?? null;
  const inTab = data.filter((s) => s.status === activeTab).map((s) => s.id);
  const selectedInTab = selected.filter((id) => inTab.includes(id));

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
  });

  return {
    ...actions,
    query,
    setQuery,
    type,
    setType,
    types,
    data,
    busy,
    activeTab,
    selected,
    selectedInTab,
    selectable: isDecisionTab(activeTab),
    reviewing,
    rejectError: reject.error?.message,
    isLoading: submissions.isLoading,
    error: submissions.isError ? submissions.error : null,
  };
};
