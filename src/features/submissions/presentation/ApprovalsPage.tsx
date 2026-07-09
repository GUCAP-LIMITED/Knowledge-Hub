import { useState, type ReactElement, type ReactNode } from 'react';
import { Eye } from 'lucide-react';
import { Alert, Button, PageHeader, Spinner, Tabs, TabsPanel } from '@shared/ui';
import type { Submission, SubmissionStatus } from '../domain';
import { SubmissionRow } from './SubmissionRow';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import {
  useApproveSubmission,
  useFlagSubmission,
  usePublishSubmission,
  useRejectSubmission,
  useSubmissions,
} from './use-submissions';
import styles from './ApprovalsPage.module.css';

const TABS: readonly { readonly value: SubmissionStatus; readonly label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'Under review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
];

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
  renderActions,
}: {
  readonly submissions: readonly Submission[];
  readonly renderActions: (submission: Submission) => ReactNode;
}): ReactElement => {
  if (submissions.length === 0) {
    return <p className={styles.empty}>Nothing in this queue.</p>;
  }
  return (
    <div className={styles.list}>
      {submissions.map((submission) => (
        <SubmissionRow key={submission.id} submission={submission}>
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
  renderActions,
}: {
  readonly data: readonly Submission[];
  readonly activeTab: string;
  readonly onTabChange: (value: string) => void;
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
            renderActions={renderActions}
          />
        </TabsPanel>
      ))}
    </Tabs>
  );
};

/** Reviewer approval queue with a rich review modal (preview + decision + timeline). Admin only. */
export const ApprovalsPage = (): ReactElement => {
  const submissions = useSubmissions();
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const flag = useFlagSubmission();
  const publish = usePublishSubmission();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [reviewId, setReviewId] = useState<string | null>(null);

  const busy =
    approve.isPending || reject.isPending || flag.isPending || publish.isPending;
  const data = submissions.data ?? [];
  const reviewing = data.find((submission) => submission.id === reviewId) ?? null;
  const closeReview = (): void => {
    setReviewId(null);
  };

  const renderActions = (submission: Submission): ReactNode => (
    <SubmissionActions
      submission={submission}
      busy={busy}
      onReview={(target) => {
        setReviewId(target.id);
      }}
      onPublish={(id) => {
        publish.mutate(id);
      }}
    />
  );

  if (submissions.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading approval queue" />
      </div>
    );
  }
  if (submissions.isError) {
    return (
      <Alert tone="error" title="Could not load the queue">
        {submissions.error.message}
      </Alert>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Approval Queue"
        subtitle="Review submissions and decide what gets published."
      />
      <ApprovalTabs
        data={data}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderActions={renderActions}
      />
      <ReviewSubmissionModal
        submission={reviewing}
        isBusy={busy}
        rejectError={reject.error?.message}
        onClose={closeReview}
        onApprove={(id, note) => {
          approve.mutate(note.length > 0 ? { id, note } : { id }, {
            onSuccess: closeReview,
          });
        }}
        onReject={(id, reason) => {
          reject.mutate({ id, reason }, { onSuccess: closeReview });
        }}
        onFlag={(id) => {
          flag.mutate(id);
        }}
      />
    </section>
  );
};
