/* eslint-disable max-lines */
import { useState, useMemo, type ReactElement } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsPanel, Spinner, Alert, Button } from '@shared/ui';
import { useContentDetail, type ContentDetail } from '@features/content';
import { useMyPermissions } from '@features/permissions';
import { DetailsTab } from './DetailsTab';
import { SettingsTab } from './SettingsTab';
import styles from './EditSubmissionPage.module.css';
import { CurriculumStudio } from './CurriculumStudio';
import { TutorialContentStudio } from './TutorialContentStudio';
import { TutorialQuizStudio } from './TutorialQuizStudio';
import { ResourceFilesStudio } from './ResourceFilesStudio';
import { DraftEditorProvider } from './DraftEditorProvider';
import { useDraftEditor } from './use-draft-editor';

const resolveTypeTitle = (key: 'course' | 'tutorial' | 'resource'): string => {
  if (key === 'course') return 'Edit Course';
  if (key === 'tutorial') return 'Edit Tutorial';
  return 'Edit Resource';
};

const resolveStatusBadgeColors = (
  isPendingReview: boolean,
  isDraftDirtyOrRemote: boolean,
): { readonly bg: string; readonly color: string } => {
  if (isPendingReview) {
    return { bg: 'var(--color-warning-subtle)', color: 'var(--color-warning)' };
  }
  if (isDraftDirtyOrRemote) {
    return { bg: 'var(--color-surface-hover)', color: 'var(--color-text)' };
  }
  return { bg: 'var(--color-success-subtle)', color: 'var(--color-success)' };
};

const resolveSubmitButtonLabel = (
  isSubmitting: boolean,
  isPendingReview: boolean,
  isDraftDirty: boolean,
  canApprove?: boolean,
): string => {
  if (isSubmitting) return canApprove ? 'Applying...' : 'Submitting...';
  if (isPendingReview && !isDraftDirty && !canApprove) return 'In Review';
  if (canApprove) return 'Apply & Publish';
  return 'Submit for Review';
};

const EditSubmissionTitle = ({
  typeTitle,
  title,
  badgeColors,
  statusText,
  onBack,
}: {
  readonly typeTitle: string;
  readonly title: string;
  readonly badgeColors: { readonly bg: string; readonly color: string };
  readonly statusText: string;
  readonly onBack: () => void;
}): ReactElement => (
  <>
    <div>
      <button type="button" className={styles.backLink} onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        {typeTitle}
      </button>
      <h1 className={styles.title}>{title}</h1>
    </div>
    <div style={{ alignSelf: 'flex-end', marginBottom: '4px' }}>
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: badgeColors.bg,
          color: badgeColors.color,
        }}
      >
        {statusText}
      </span>
    </div>
  </>
);

const EditSubmissionHeader = ({
  content,
  onClearError,
  onError,
}: {
  readonly content: ContentDetail;
  readonly onClearError: () => void;
  readonly onError: (err: string) => void;
}): ReactElement => {
  const {
    statusText,
    contentTypeKey,
    isDraftDirty,
    isRemoteDraft,
    isSaving,
    isSubmitting,
    saveDraft,
    submitDraft,
    isPendingReview,
  } = useDraftEditor();
  const navigate = useNavigate();
  const { data: permissions } = useMyPermissions();
  const canApprove = permissions?.['Approvals.Approve'] === true;

  const typeTitle = resolveTypeTitle(contentTypeKey);
  const badgeColors = resolveStatusBadgeColors(
    isPendingReview,
    isRemoteDraft || isDraftDirty,
  );
  const submitLabel = resolveSubmitButtonLabel(
    isSubmitting,
    isPendingReview,
    isDraftDirty,
    canApprove,
  );
  const isSubmitDisabled =
    isSubmitting || isSaving || (isPendingReview && !isDraftDirty && !canApprove);

  const handleSave = async (): Promise<void> => {
    onClearError();
    await saveDraft();
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      onClearError();
      await submitDraft();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Submission validation failed.');
    }
  };

  return (
    <div className={styles.headerRow}>
      <EditSubmissionTitle
        typeTitle={typeTitle}
        title={content.title}
        badgeColors={badgeColors}
        statusText={statusText}
        onBack={() => {
          navigate('/submissions');
        }}
      />
      <div className={styles.headerActions}>
        <Button
          variant="outline"
          onClick={() => void handleSave()}
          disabled={isSaving || isSubmitting}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          variant="default"
          onClick={() => void handleSubmit()}
          disabled={isSubmitDisabled}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

const buildTabs = (
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): readonly { readonly value: string; readonly label: string }[] => {
  if (contentTypeKey === 'course') {
    return [
      { value: 'details', label: 'Details' },
      { value: 'curriculum', label: 'Curriculum' },
      { value: 'settings', label: 'Settings' },
    ];
  }
  if (contentTypeKey === 'tutorial') {
    return [
      { value: 'details', label: 'Details' },
      { value: 'tutorial-content', label: 'Tutorial Content' },
      { value: 'quiz', label: 'Quiz Assessment' },
      { value: 'settings', label: 'Settings' },
    ];
  }
  return [
    { value: 'details', label: 'Details' },
    { value: 'resource-files', label: 'Files & Assets' },
    { value: 'settings', label: 'Settings' },
  ];
};

const EditSubmissionTabPanels = ({
  contentTypeKey,
  content,
}: {
  readonly contentTypeKey: 'course' | 'tutorial' | 'resource';
  readonly content: ContentDetail;
}): ReactElement => (
  <>
    <TabsPanel value="details">
      <div className={styles.tabContent}>
        <DetailsTab />
      </div>
    </TabsPanel>

    {contentTypeKey === 'course' && (
      <TabsPanel value="curriculum">
        <div className={styles.tabContent}>
          <CurriculumStudio />
        </div>
      </TabsPanel>
    )}

    {contentTypeKey === 'tutorial' && (
      <>
        <TabsPanel value="tutorial-content">
          <div className={styles.tabContent}>
            <TutorialContentStudio />
          </div>
        </TabsPanel>
        <TabsPanel value="quiz">
          <div className={styles.tabContent}>
            <TutorialQuizStudio content={content} />
          </div>
        </TabsPanel>
      </>
    )}

    {contentTypeKey === 'resource' && (
      <TabsPanel value="resource-files">
        <div className={styles.tabContent}>
          <ResourceFilesStudio />
        </div>
      </TabsPanel>
    )}

    <TabsPanel value="settings">
      <div className={styles.tabContent}>
        <SettingsTab content={content} />
      </div>
    </TabsPanel>
  </>
);

const EditSubmissionContent = ({
  content,
}: {
  readonly content: ContentDetail;
}): ReactElement => {
  const { isRejected, reviewerNotes, contentTypeKey } = useDraftEditor();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs = useMemo(() => buildTabs(contentTypeKey), [contentTypeKey]);
  const defaultTab =
    contentTypeKey === 'course'
      ? 'curriculum'
      : contentTypeKey === 'tutorial'
        ? 'tutorial-content'
        : 'resource-files';
  const queryTab = searchParams.get('tab');
  const initialTab =
    queryTab && tabs.some((t) => t.value === queryTab) ? queryTab : defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (nextTab: string): void => {
    setActiveTab(nextTab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', nextTab);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <section className={styles.screen}>
      <EditSubmissionHeader
        content={content}
        onClearError={() => {
          setSubmitError(null);
        }}
        onError={(err) => {
          setSubmitError(err);
        }}
      />

      {submitError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="error" title="Cannot Submit for Review">
            <p style={{ margin: '0.25rem 0 0 0' }}>{submitError}</p>
          </Alert>
        </div>
      )}

      {isRejected && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="warning" title="Changes Requested by Reviewer">
            <p style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap' }}>
              {reviewerNotes ??
                'The reviewer requested changes before this draft can be published.'}
            </p>
          </Alert>
        </div>
      )}

      <div className={styles.dashboardCard}>
        <div className={styles.tabsContainer}>
          <Tabs tabs={tabs} value={activeTab} onValueChange={handleTabChange}>
            <EditSubmissionTabPanels contentTypeKey={contentTypeKey} content={content} />
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export const EditSubmissionPage = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
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
    <DraftEditorProvider content={content}>
      <EditSubmissionContent content={content} />
    </DraftEditorProvider>
  );
};
