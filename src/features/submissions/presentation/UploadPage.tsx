import { useState, type ReactElement } from 'react';
import { PageHeader } from '@shared/ui';
import { useAuth } from '@features/auth';
import { useSubmitContent } from './use-submissions';
import {
  DoneCard,
  UploadFooter,
  UploadWizard,
  type Details,
  type PickedFile,
} from './UploadSteps';
import styles from './UploadPage.module.css';

const EMPTY_DETAILS: Details = { title: '', type: 'Document', description: '' };

/** Upload Document: a 3-step drag-drop create flow that emits a submission. Admin+manager. */
export const UploadPage = (): ReactElement => {
  const { user } = useAuth();
  const submit = useSubmitContent();
  const isAdmin = user?.hasRole('admin') ?? false;
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [done, setDone] = useState(false);

  const reset = (): void => {
    setDone(false);
    setStep(1);
    setFile(null);
    setDetails(EMPTY_DETAILS);
  };

  const doSubmit = (): void => {
    submit.mutate(
      {
        title: details.title,
        type: details.type,
        submittedBy: user?.fullName ?? 'You',
        publishDirectly: isAdmin,
      },
      {
        onSuccess: () => {
          setDone(true);
        },
      },
    );
  };

  if (done) {
    return (
      <section className={styles.screen}>
        <PageHeader title="Upload Document" />
        <DoneCard isAdmin={isAdmin} onReset={reset} />
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Upload Document"
        subtitle={
          isAdmin
            ? 'Publish documents directly to the platform.'
            : 'Submit documents for admin review.'
        }
      />
      <UploadWizard
        step={step}
        file={file}
        onFile={setFile}
        details={details}
        onDetailsSubmit={(next) => {
          setDetails(next);
          setStep(3);
        }}
        isAdmin={isAdmin}
        submitError={submit.isError ? submit.error.message : undefined}
        footer={
          <UploadFooter
            step={step}
            fileReady={file !== null}
            isAdmin={isAdmin}
            isSubmitting={submit.isPending}
            onBack={() => {
              setStep(step - 1);
            }}
            onContinue={() => {
              setStep(2);
            }}
            onSubmit={doSubmit}
          />
        }
      />
    </section>
  );
};
