import type { ReactElement, ReactNode, Ref } from 'react';
import { Button, EmptyState, Spinner, Tabs, TabsPanel } from '@shared/ui';
import type { ApprovalStatusCounts, Submission, SubmissionStatus } from '../domain';
import { SubmissionRow } from './SubmissionRow';
import styles from './ApprovalsPage.module.css';

const SUBMISSION_STATUS_TABS: readonly {
  readonly value: SubmissionStatus;
  readonly label: string;
}[] = [
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

interface ApprovalTabsProps {
  readonly data: readonly Submission[];
  readonly activeTab: string;
  readonly onTabChange: (value: string) => void;
  readonly selection: Selection;
  readonly statusCounts?: ApprovalStatusCounts | undefined;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly sentinelRef: Ref<HTMLDivElement>;
  readonly renderActions: (submission: Submission) => ReactNode;
  readonly filtered: boolean;
  readonly onClearAll: () => void;
}

const resolveStatusTabCount = (
  status: SubmissionStatus,
  counts?: ApprovalStatusCounts,
): number => {
  if (!counts) return 0;
  switch (status) {
    case 'pending':
      return counts.pending;
    case 'review':
      return counts.inReview;
    case 'approved':
      return counts.approved;
    case 'published':
      return counts.published;
    case 'rejected':
      return counts.rejected;
  }
};

const QueueList = ({
  submissions,
  selection,
  renderActions,
  filtered,
  onClearAll,
}: {
  readonly submissions: readonly Submission[];
  readonly selection: Selection;
  readonly renderActions: (submission: Submission) => ReactNode;
  readonly filtered: boolean;
  readonly onClearAll: () => void;
}): ReactElement => {
  if (submissions.length === 0) {
    return (
      <EmptyState
        title="Nothing here"
        description="No submissions match this view."
        action={
          filtered ? (
            <Button variant="outline" onClick={onClearAll}>
              Clear all filters
            </Button>
          ) : undefined
        }
      />
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

export const ApprovalTabs = ({
  data,
  activeTab,
  onTabChange,
  selection,
  statusCounts,
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
  renderActions,
  filtered,
  onClearAll,
}: ApprovalTabsProps): ReactElement => {
  const tabs = SUBMISSION_STATUS_TABS.map((tab) => ({
    value: tab.value,
    label: `${tab.label} (${String(resolveStatusTabCount(tab.value, statusCounts))})`,
  }));

  return (
    <Tabs tabs={tabs} value={activeTab} onValueChange={onTabChange}>
      {SUBMISSION_STATUS_TABS.map((tab) => (
        <TabsPanel key={tab.value} value={tab.value}>
          {tab.value === activeTab && (
            <>
              <QueueList
                submissions={data}
                selection={selection}
                renderActions={renderActions}
                filtered={filtered}
                onClearAll={onClearAll}
              />
              {hasNextPage && (
                <div ref={sentinelRef} className={styles.sentinelWrap}>
                  {isFetchingNextPage && <Spinner label="Loading more submissions..." />}
                </div>
              )}
            </>
          )}
        </TabsPanel>
      ))}
    </Tabs>
  );
};
