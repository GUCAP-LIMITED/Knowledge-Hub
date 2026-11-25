import type { ReactElement } from 'react';
import { PageHeader } from '@shared/ui';
import { cn } from '@shared/utils';
import { useMyPermissions } from '@features/permissions';
import { typeLabel } from './upload-content-types';
import { DoneCard } from './UploadSteps';
import { DraftBanner } from './DraftBanner';
import { UploadWizard } from './UploadWizard';
import { UploadFooter } from './UploadFooter';
import { useUploadFlow } from './use-upload-flow';
import styles from './UploadPage.module.css';

/** Upload Document: a type-aware create wizard (type → details → upload → review → publish). */
export const UploadPage = (): ReactElement => {
  const flow = useUploadFlow();
  const { data: permissions } = useMyPermissions();
  const canCreateSubmission = permissions?.['Submissions.Create'] === true;

  if (flow.done) {
    return (
      <section className={styles.screen}>
        <PageHeader title="Upload Document" />
        <DoneCard
          isAdmin={flow.publishesDirectly}
          created={flow.created}
          onReset={flow.reset}
        />
      </section>
    );
  }

  const stepKey = flow.steps[flow.current];
  const isTypeStep = stepKey === 'type';
  const showDraftBanner = flow.draft.hasDraft && flow.contentType === null;

  return (
    <section className={cn(styles.screen, isTypeStep && styles.screenWide)}>
      <PageHeader
        title="Upload Document"
        subtitle={
          flow.publishesDirectly
            ? 'Publish content directly to the platform.'
            : 'Submit content for admin review.'
        }
      />
      {showDraftBanner ? (
        <DraftBanner
          draftInfo={flow.draft.draftInfo}
          savedAt={flow.draft.savedAt}
          onResume={flow.draft.resume}
          onDiscard={flow.draft.dismiss}
        />
      ) : null}
      <UploadWizard
        steps={flow.steps}
        current={flow.current}
        saveStatus={flow.draft.status}
        contentType={flow.contentType}
        onType={flow.chooseType}
        slots={flow.slots}
        files={flow.files}
        onFiles={flow.setFiles}
        videoPlaylist={flow.videoPlaylist}
        onVideoPlaylistChange={flow.setVideoPlaylist}
        details={flow.details}
        onDetailsSubmit={flow.submitDetails}
        sections={flow.sections}
        onSections={flow.setSections}
        quiz={flow.quiz}
        onQuizChange={flow.setQuiz}
        missing={flow.missing}
        attempt={flow.attempt}
        author={flow.author}
        isAdmin={flow.publishesDirectly}
        submitError={flow.submitError}
        wasCancelled={flow.wasCancelled}
        footer={
          <UploadFooter
            stepKey={stepKey}
            isFirst={flow.current === 0}
            isAdmin={flow.publishesDirectly}
            isSubmitting={flow.isSubmitting}
            canCreateSubmission={canCreateSubmission}
            selectedTypeLabel={
              flow.contentType === null ? null : typeLabel(flow.contentType)
            }
            onBack={flow.back}
            onContinue={flow.next}
            onSubmit={flow.publish}
          />
        }
      />
    </section>
  );
};
