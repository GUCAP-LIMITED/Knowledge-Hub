import type { ReactElement } from 'react';
import { Button, PageHeader } from '@shared/ui';
import { DoneCard } from './UploadSteps';
import { UploadWizard } from './UploadWizard';
import { UploadFooter } from './UploadFooter';
import { useUploadFlow } from './use-upload-flow';
import styles from './UploadPage.module.css';

/** Upload Document: a type-aware create wizard (type → upload → details → curriculum → review). */
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

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Upload Document"
        subtitle={
          flow.isAdmin
            ? 'Publish content directly to the platform.'
            : 'Submit content for admin review.'
        }
      />
      {flow.draft.hasDraft && flow.contentType === null ? (
        <div className={styles.resumeBanner}>
          <span>You have an unsaved draft from a previous session.</span>
          <div className={styles.resumeActions}>
            <Button size="sm" variant="ghost" onClick={flow.draft.dismiss}>
              Discard
            </Button>
            <Button size="sm" onClick={flow.draft.resume}>
              Resume draft
            </Button>
          </div>
        </div>
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
            stepKey={flow.steps[flow.current]}
            isFirst={flow.current === 0}
            fileReady={flow.fileReady}
            isAdmin={flow.isAdmin}
            isSubmitting={flow.isSubmitting}
            onBack={flow.back}
            onContinue={flow.next}
            onSubmit={flow.publish}
          />
        }
      />
    </section>
  );
};
