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

export interface ApprovalQueue {
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly type: string;
  readonly setType: (value: string) => void;
  readonly types: readonly string[];
  readonly data: readonly Submission[];
  readonly busy: boolean;
  readonly activeTab: string;
  readonly switchTab: (value: string) => void;
  readonly selected: readonly string[];
  readonly selectedInTab: readonly string[];
  readonly toggleSelect: (id: string) => void;
  readonly clearSelected: () => void;
  readonly selectable: boolean;
  readonly approveSelected: () => void;
  readonly reviewing: Submission | null;
  readonly openReview: (submission: Submission) => void;
  readonly closeReview: () => void;
  readonly approveReviewed: (id: string, note: string) => void;
  readonly rejectReviewed: (id: string, reason: string) => void;
  readonly flag: (id: string) => void;
  readonly publish: (id: string) => void;
  readonly rejectError: string | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

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

  const switchTab = (value: string): void => {
    setActiveTab(value);
    setSelected([]);
  };
  const toggleSelect = (id: string): void => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const approveSelected = (): void => {
    selectedInTab.forEach((id) => {
      approve.mutate({ id });
    });
    setSelected([]);
  };
  const approveReviewed = (id: string, note: string): void => {
    approve.mutate(note.length > 0 ? { id, note } : { id }, {
      onSuccess: () => {
        setReviewId(null);
      },
    });
  };
  const rejectReviewed = (id: string, reason: string): void => {
    reject.mutate(
      { id, reason },
      {
        onSuccess: () => {
          setReviewId(null);
        },
      },
    );
  };

  return {
    query,
    setQuery,
    type,
    setType,
    types,
    data,
    busy,
    activeTab,
    switchTab,
    selected,
    selectedInTab,
    toggleSelect,
    clearSelected: () => {
      setSelected([]);
    },
    selectable: isDecisionTab(activeTab),
    approveSelected,
    reviewing,
    openReview: (submission: Submission) => {
      setReviewId(submission.id);
    },
    closeReview: () => {
      setReviewId(null);
    },
    approveReviewed,
    rejectReviewed,
    flag: (id: string) => {
      flag.mutate(id);
    },
    publish: (id: string) => {
      publish.mutate(id);
    },
    rejectError: reject.error?.message,
    isLoading: submissions.isLoading,
    error: submissions.isError ? submissions.error : null,
  };
};
