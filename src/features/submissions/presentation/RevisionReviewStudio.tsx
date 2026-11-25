/* eslint-disable max-lines-per-function, complexity */
import { useState, useMemo, type ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsPanel, Spinner, Alert } from '@shared/ui';
import {
  useContentDetail,
  useApproveRevision,
  useRejectRevision,
  useGetActiveRevision,
  useGetRevision,
  type ContentDetail,
} from '@features/content';
import {
  useApproveSubmission,
  useRejectSubmission,
  useFlagSubmission,
  usePublishSubmission,
} from './use-submissions';
import { DetailsTab } from './DetailsTab';
import { SettingsTab } from './SettingsTab';
import { CurriculumStudio } from './CurriculumStudio';
import { TutorialContentStudio } from './TutorialContentStudio';
import { TutorialQuizStudio } from './TutorialQuizStudio';
import { ResourceFilesStudio } from './ResourceFilesStudio';
import { LearnerPreviewTab } from './LearnerPreviewTab';
import { ReviewStudioHeader } from './ReviewStudioHeader';
import { ReviewRejectModal } from './ReviewRejectModal';
import { DraftEditorProvider } from './DraftEditorProvider';
import { useDraftEditor } from './use-draft-editor';
import styles from './EditSubmissionPage.module.css';

const ReviewStudioContent = ({
  content,
  revisionId,
}: {
  readonly content: ContentDetail;
  readonly revisionId?: string | undefined;
}): ReactElement => {
  const [activeTab, setActiveTab] = useState('details');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const navigate = useNavigate();
  const { contentTypeKey } = useDraftEditor();

  const { data: activeRevisionData } = useGetActiveRevision(content.id, {
    enabled: !revisionId,
  });
  const { data: specificRevisionData } = useGetRevision(revisionId ?? '', {
    enabled: Boolean(revisionId),
  });

  const activeRevision = revisionId ? specificRevisionData : activeRevisionData;
  const isRevision = Boolean(revisionId ?? activeRevision);
  const isNewSubmission = !isRevision;

  const authorDisplayName = isRevision
    ? (activeRevision?.authorName ??
      content.submittedByName ??
      content.ownerName ??
      'Author')
    : (content.submittedByName ?? content.ownerName ?? 'Author');

  const currentStatus = isRevision ? (activeRevision?.status ?? 5) : content.status;

  const submittedAtDate = isRevision
    ? (activeRevision?.creationTime ?? content.submittedAt)
    : content.submittedAt;

  const previousFeedback = isRevision
    ? (activeRevision?.reviewerNotes ?? content.reviewNote)
    : content.reviewNote;

  // Reviewable status checks
  const isReviewable = isRevision
    ? activeRevision
      ? activeRevision.status === 5 || activeRevision.status === 10
      : true
    : content.status === 5 || content.status === 10 || content.status === 15;

  // Mutations
  const approveRev = useApproveRevision(content.id);
  const rejectRev = useRejectRevision(content.id);
  const approveSub = useApproveSubmission();
  const rejectSub = useRejectSubmission();
  const flagSub = useFlagSubmission();
  const publishSub = usePublishSubmission();

  const tabs = useMemo(() => {
    if (contentTypeKey === 'course') {
      return [
        { value: 'details', label: 'Details' },
        { value: 'curriculum', label: 'Curriculum' },
        { value: 'settings', label: 'Settings' },
        { value: 'learner-preview', label: 'Learner Preview' },
      ];
    }
    if (contentTypeKey === 'tutorial') {
      return [
        { value: 'details', label: 'Details' },
        { value: 'tutorial-content', label: 'Tutorial Content' },
        { value: 'quiz', label: 'Quiz Assessment' },
        { value: 'settings', label: 'Settings' },
        { value: 'learner-preview', label: 'Learner Preview' },
      ];
    }
    return [
      { value: 'details', label: 'Details' },
      { value: 'resource-files', label: 'Files & Assets' },
      { value: 'settings', label: 'Settings' },
      { value: 'learner-preview', label: 'Learner Preview' },
    ];
  }, [contentTypeKey]);

  const handleApprove = async (): Promise<void> => {
    if (isRevision) {
      await approveRev.mutateAsync({ notes: 'Approved by reviewer' });
      navigate('/approvals?tab=revisions');
    } else {
      await approveSub.mutateAsync({ id: content.id, note: 'Approved by reviewer' });
      navigate('/approvals?tab=submissions');
    }
  };

  const handleApproveAndPublish = async (): Promise<void> => {
    if (isRevision) {
      await approveRev.mutateAsync({ notes: 'Approved by reviewer' });
      navigate('/approvals?tab=revisions');
    } else {
      await approveSub.mutateAsync({ id: content.id, note: 'Approved by reviewer' });
      await publishSub.mutateAsync(content.id);
      navigate('/approvals?tab=submissions');
    }
  };

  const handlePublish = async (): Promise<void> => {
    await publishSub.mutateAsync(content.id);
    navigate('/approvals?tab=submissions');
  };

  const handleFlag = async (): Promise<void> => {
    await flagSub.mutateAsync(content.id);
  };

  const handleRejectConfirm = async (reason: string): Promise<void> => {
    if (isRevision) {
      await rejectRev.mutateAsync({ reason });
      setIsRejectModalOpen(false);
      navigate('/approvals?tab=revisions');
    } else {
      await rejectSub.mutateAsync({ id: content.id, reason });
      setIsRejectModalOpen(false);
      navigate('/approvals?tab=submissions');
    }
  };

  return (
    <section className={styles.screen}>
      <ReviewStudioHeader
        content={content}
        submitterName={authorDisplayName}
        status={currentStatus}
        submittedAt={submittedAtDate}
        reviewNote={previousFeedback}
        reviewedByName={content.reviewedByName}
        isRevision={isRevision}
        isReviewable={isReviewable}
        isNewSubmission={isNewSubmission}
        isApproving={isRevision ? approveRev.isPending : approveSub.isPending}
        isPublishing={publishSub.isPending}
        isFlagging={flagSub.isPending}
        isRejecting={isRevision ? rejectRev.isPending : rejectSub.isPending}
        onApprove={() => {
          void handleApprove();
        }}
        onApproveAndPublish={() => {
          void handleApproveAndPublish();
        }}
        onPublish={() => {
          void handlePublish();
        }}
        onFlag={() => {
          void handleFlag();
        }}
        onReject={() => {
          setIsRejectModalOpen(true);
        }}
      />

      <div className={styles.dashboardCard}>
        <div className={styles.tabsContainer}>
          <Tabs tabs={tabs} value={activeTab} onValueChange={setActiveTab}>
            <TabsPanel value="details">
              <div className={styles.tabContent}>
                <DetailsTab readOnly />
              </div>
            </TabsPanel>

            {contentTypeKey === 'course' && (
              <TabsPanel value="curriculum">
                <div className={styles.tabContent}>
                  <CurriculumStudio readOnly />
                </div>
              </TabsPanel>
            )}

            {contentTypeKey === 'tutorial' && (
              <>
                <TabsPanel value="tutorial-content">
                  <div className={styles.tabContent}>
                    <TutorialContentStudio readOnly />
                  </div>
                </TabsPanel>
                <TabsPanel value="quiz">
                  <div className={styles.tabContent}>
                    <TutorialQuizStudio readOnly content={content} />
                  </div>
                </TabsPanel>
              </>
            )}

            {contentTypeKey === 'resource' && (
              <TabsPanel value="resource-files">
                <div className={styles.tabContent}>
                  <ResourceFilesStudio readOnly />
                </div>
              </TabsPanel>
            )}

            <TabsPanel value="settings">
              <div className={styles.tabContent}>
                <SettingsTab content={content} readOnly />
              </div>
            </TabsPanel>

            <TabsPanel value="learner-preview">
              <div className={styles.tabContent}>
                <LearnerPreviewTab authorName={authorDisplayName} />
              </div>
            </TabsPanel>
          </Tabs>
        </div>
      </div>

      <ReviewRejectModal
        open={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
        }}
        onConfirm={handleRejectConfirm}
        isPending={isRevision ? rejectRev.isPending : rejectSub.isPending}
        title={isRevision ? 'Reject Content Revision' : 'Reject New Submission'}
      />
    </section>
  );
};

export const RevisionReviewStudio = (): ReactElement => {
  const { id, revisionId } = useParams<{ id: string; revisionId?: string }>();
  const { data: content, isLoading, error } = useContentDetail(id ?? '');

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner size="lg" label="Loading submission details" />
      </div>
    );
  }

  if (error !== null || content === undefined) {
    return (
      <section className={styles.screen}>
        <Alert tone="error" title="Error loading submission">
          {error?.message ?? 'Unknown error'}
        </Alert>
      </section>
    );
  }

  return (
    <DraftEditorProvider content={content} revisionId={revisionId}>
      <ReviewStudioContent content={content} revisionId={revisionId} />
    </DraftEditorProvider>
  );
};
