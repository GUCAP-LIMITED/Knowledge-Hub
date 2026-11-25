import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { Alert, Button, PageHeader, RowListSkeleton, Tabs, TabsPanel } from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import type { Submission } from '../domain';
import { ApprovalsToolbar } from './ApprovalsToolbar';
import { ApprovalTabs } from './ApprovalTabs';
import { BulkActionBar } from './BulkActionBar';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import { useApprovalQueue } from './use-approval-queue';
import { PendingRevisionsTable } from './PendingRevisionsTable';
import styles from './ApprovalsPage.module.css';

const SubmissionActions = ({
  submission,
  busy,
  onPublish,
}: {
  readonly submission: Submission;
  readonly busy: boolean;
  readonly onPublish: (id: string) => void;
}): ReactElement | null => {
  const navigate = useNavigate();
  const { can } = useMyCapabilities();

  if (submission.awaitsDecision()) {
    return (
      <Button
        size="sm"
        disabled={busy}
        onClick={() => {
          navigate(`/approvals/review/${submission.id}`);
        }}
      >
        <Eye size={14} aria-hidden="true" /> Review
      </Button>
    );
  }
  if (submission.status === 'approved') {
    return (
      <div className={styles.actionsRow}>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            navigate(`/approvals/review/${submission.id}`);
          }}
        >
          <Eye size={14} aria-hidden="true" /> View
        </Button>
        {can('approvals', 'publish') ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => {
              onPublish(submission.id);
            }}
          >
            Publish
          </Button>
        ) : null}
      </div>
    );
  }
  if (submission.isFinal()) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          navigate(`/approvals/review/${submission.id}`);
        }}
      >
        <Eye size={14} aria-hidden="true" /> View
      </Button>
    );
  }
  return null;
};

/** Reviewer approval queue: filter, tabs, bulk approve, and a rich review modal. Admin only. */
// eslint-disable-next-line max-lines-per-function
export const ApprovalsPage = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromDashboard = Boolean(
    (location.state as { fromDashboardAction?: boolean } | null)?.fromDashboardAction,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMainTab = searchParams.get('tab') ?? 'submissions';

  const q = useApprovalQueue();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = q;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderActions = (submission: Submission): ReactNode => (
    <SubmissionActions submission={submission} busy={q.busy} onPublish={q.publish} />
  );

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Approval Queue"
        subtitle="Review new submissions and content revisions."
      >
        {isFromDashboard ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate('/dashboard');
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
          </Button>
        ) : null}
      </PageHeader>
      <Tabs
        tabs={[
          { value: 'submissions', label: 'New Content Submissions' },
          { value: 'revisions', label: 'Content Revisions' },
        ]}
        value={activeMainTab}
        onValueChange={(val) => {
          setSearchParams({ tab: val });
        }}
      >
        <TabsPanel value="submissions">
          <div className={styles.panelBody}>
            <ApprovalsToolbar
              query={q.query}
              type={q.type}
              types={q.types}
              onQuery={q.setQuery}
              onType={q.setType}
              onClearAll={q.clearFilters}
            />

            {q.isLoading ? (
              <RowListSkeleton count={6} leading trailing />
            ) : q.error !== null ? (
              <Alert tone="error" title="Could not load the queue">
                {q.error.message}
              </Alert>
            ) : (
              <>
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
                  statusCounts={q.statusCounts}
                  hasNextPage={q.hasNextPage}
                  isFetchingNextPage={q.isFetchingNextPage}
                  sentinelRef={sentinelRef}
                  renderActions={renderActions}
                  filtered={q.filtered}
                  onClearAll={q.clearFilters}
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
              </>
            )}
          </div>
        </TabsPanel>

        <TabsPanel value="revisions">
          <PendingRevisionsTable />
        </TabsPanel>
      </Tabs>
    </section>
  );
};
