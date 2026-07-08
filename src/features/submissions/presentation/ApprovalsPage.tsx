import { useState, type ReactElement, type ReactNode } from 'react';
import { Alert, Button, Spinner, Tabs, TabsPanel } from '@shared/ui';
import type { Submission, SubmissionStatus } from '../domain';
import { SubmissionRow } from './SubmissionRow';
import { RejectDialog } from './RejectDialog';
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

interface ActionsProps {
  readonly submission: Submission;
  readonly busy: boolean;
  readonly onApprove: (id: string) => void;
  readonly onFlag: (id: string) => void;
  readonly onPublish: (id: string) => void;
  readonly onReject: (id: string) => void;
}

const SubmissionActions = ({
  submission,
  busy,
  onApprove,
  onFlag,
  onPublish,
  onReject,
}: ActionsProps): ReactElement | null => {
  const id = submission.id;
  if (submission.status === 'pending' || submission.status === 'review') {
    return (
      <>
        <Button
          size="sm"
          disabled={busy}
          onClick={() => {
            onApprove(id);
          }}
        >
          Approve
        </Button>
        {submission.status === 'pending' ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              onFlag(id);
            }}
          >
            Flag
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="danger"
          disabled={busy}
          onClick={() => {
            onReject(id);
          }}
        >
          Reject
        </Button>
      </>
    );
  }
  if (submission.status === 'approved') {
    return (
      <Button
        size="sm"
        disabled={busy}
        onClick={() => {
          onPublish(id);
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

const RejectController = ({
  rejectId,
  isRejecting,
  rejectError,
  onConfirm,
  onClose,
}: {
  readonly rejectId: string | null;
  readonly isRejecting: boolean;
  readonly rejectError: string | undefined;
  readonly onConfirm: (id: string, reason: string) => void;
  readonly onClose: () => void;
}): ReactElement => (
  <RejectDialog
    open={rejectId !== null}
    onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}
    onConfirm={(reason) => {
      if (rejectId !== null) {
        onConfirm(rejectId, reason);
      }
    }}
    isSubmitting={isRejecting}
    error={rejectError}
  />
);

/** Reviewer approval queue, grouped by status. Admin only. */
export const ApprovalsPage = (): ReactElement => {
  const submissions = useSubmissions();
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const flag = useFlagSubmission();
  const publish = usePublishSubmission();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const busy =
    approve.isPending || reject.isPending || flag.isPending || publish.isPending;

  const renderActions = (submission: Submission): ReactNode => (
    <SubmissionActions
      submission={submission}
      busy={busy}
      onApprove={(id) => {
        approve.mutate({ id });
      }}
      onFlag={(id) => {
        flag.mutate(id);
      }}
      onPublish={(id) => {
        publish.mutate(id);
      }}
      onReject={setRejectId}
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
      <header className={styles.header}>
        <h1 className={styles.title}>Approval Queue</h1>
        <p className={styles.subtitle}>
          Review, approve, publish or reject submitted content.
        </p>
      </header>
      <ApprovalTabs
        data={submissions.data ?? []}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderActions={renderActions}
      />
      <RejectController
        rejectId={rejectId}
        isRejecting={reject.isPending}
        rejectError={reject.error?.message}
        onConfirm={(id, reason) => {
          reject.mutate(
            { id, reason },
            {
              onSuccess: () => {
                setRejectId(null);
              },
            },
          );
        }}
        onClose={() => {
          setRejectId(null);
        }}
      />
    </section>
  );
};
