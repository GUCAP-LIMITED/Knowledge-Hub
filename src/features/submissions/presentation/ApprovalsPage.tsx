import type { ReactElement, ReactNode } from 'react';
import { Eye } from 'lucide-react';
import {
  Alert,
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  Tabs,
  TabsPanel,
} from '@shared/ui';
import type { Submission, SubmissionStatus } from '../domain';
import { SubmissionRow } from './SubmissionRow';
import { ApprovalsToolbar } from './ApprovalsToolbar';
import { BulkActionBar } from './BulkActionBar';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import { useApprovalQueue } from './use-approval-queue';
import styles from './ApprovalsPage.module.css';

const TABS: readonly { readonly value: SubmissionStatus; readonly label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'Under review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
];

interface Selection {
  readonly ids: readonly string[];
  readonly selectable: boolean;
  readonly onToggle: (id: string) => void;
}

const SubmissionActions = ({
  submission,
  busy,
  onReview,
  onPublish,
}: {
  readonly submission: Submission;
  readonly busy: boolean;
  readonly onReview: (submission: Submission) => void;
  readonly onPublish: (id: string) => void;
}): ReactElement | null => {
  if (submission.awaitsDecision()) {
    return (
      <Button
        size="sm"
        disabled={busy}
        onClick={() => {
          onReview(submission);
        }}
      >
        <Eye size={14} aria-hidden="true" /> Review
      </Button>
    );
  }
  if (submission.status === 'approved') {
    return (
      <Button
        size="sm"
        disabled={busy}
        onClick={() => {
          onPublish(submission.id);
        }}
      >
        Publish
      </Button>
    );
  }
  return null;
};

const QueueList = ({
  submissions,
  selection,
  renderActions,
}: {
  readonly submissions: readonly Submission[];
  readonly selection: Selection;
  readonly renderActions: (submission: Submission) => ReactNode;
}): ReactElement => {
  if (submissions.length === 0) {
    return (
      <EmptyState title="Nothing here" description="No submissions match this view." />
    );
  }
  return (
    <div className={styles.list}>
      {submissions.map((submission) => (
        <SubmissionRow
          key={submission.id}
          submission={submission}
          showStatus={false}
          selected={selection.ids.includes(submission.id)}
          {...(selection.selectable ? { onToggleSelect: selection.onToggle } : {})}
        >
          {renderActions(submission)}
        </SubmissionRow>
      ))}
    </div>
  );
};

const ApprovalTabs = ({
  data,
  activeTab,
  onTabChange,
  selection,
  renderActions,
}: {
  readonly data: readonly Submission[];
  readonly activeTab: string;
  readonly onTabChange: (value: string) => void;
  readonly selection: Selection;
  readonly renderActions: (submission: Submission) => ReactNode;
}): ReactElement => {
  const tabs = TABS.map((tab) => ({
    value: tab.value,
    label: `${tab.label} (${String(data.filter((s) => s.status === tab.value).length)})`,
  }));
  return (
    <Tabs tabs={tabs} value={activeTab} onValueChange={onTabChange}>
      {TABS.map((tab) => (
        <TabsPanel key={tab.value} value={tab.value}>
          <QueueList
            submissions={data.filter((s) => s.status === tab.value)}
            selection={selection}
            renderActions={renderActions}
          />
        </TabsPanel>
      ))}
    </Tabs>
  );
};

/** Reviewer approval queue: filter, tabs, bulk approve, and a rich review modal. Admin only. */
export const ApprovalsPage = (): ReactElement => {
  const q = useApprovalQueue();
  const renderActions = (submission: Submission): ReactNode => (
    <SubmissionActions
      submission={submission}
      busy={q.busy}
      onReview={q.openReview}
      onPublish={q.publish}
    />
  );

  if (q.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading approval queue" />
      </div>
    );
  }
  if (q.error !== null) {
    return (
      <Alert tone="error" title="Could not load the queue">
        {q.error.message}
      </Alert>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Approval Queue"
        subtitle="Review submissions and decide what gets published."
      />
      <ApprovalsToolbar
        query={q.query}
        type={q.type}
        types={q.types}
        onQuery={q.setQuery}
        onType={q.setType}
      />
      <BulkActionBar
        count={q.selectedInTab.length}
        busy={q.busy}
        onApprove={q.approveSelected}
        onClear={q.clearSelected}
      />
      <ApprovalTabs
        data={q.data}
        activeTab={q.activeTab}
        onTabChange={q.switchTab}
        selection={{
          ids: q.selected,
          selectable: q.selectable,
          onToggle: q.toggleSelect,
        }}
        renderActions={renderActions}
      />
      <ReviewSubmissionModal
        submission={q.reviewing}
        isBusy={q.busy}
        rejectError={q.rejectError}
        onClose={q.closeReview}
        onApprove={q.approveReviewed}
        onReject={q.rejectReviewed}
        onFlag={q.flag}
      />
    </section>
  );
};
