import type { ReactElement } from 'react';
import { PageHeader } from '@shared/ui';
import { cn } from '@shared/utils';
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

  if (flow.done) {
    return (
      <section className={styles.screen}>
        <PageHeader title="Upload Document" />
        <DoneCard isAdmin={flow.isAdmin} onReset={flow.reset} />
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
          flow.isAdmin
            ? 'Publish content directly to the platform.'
            : 'Submit content for admin review.'
        }
      />
      {showDraftBanner ? (
        <DraftBanner
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
        details={flow.details}
        onDetailsSubmit={flow.submitDetails}
        sections={flow.sections}
        onSections={flow.setSections}
        missing={flow.missing}
        author={flow.author}
        isAdmin={flow.isAdmin}
        submitError={flow.submitError}
        footer={
          <UploadFooter
            stepKey={stepKey}
            isFirst={flow.current === 0}
            fileReady={flow.fileReady}
            canPublish={flow.missing.length === 0}
            isAdmin={flow.isAdmin}
            isSubmitting={flow.isSubmitting}
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
