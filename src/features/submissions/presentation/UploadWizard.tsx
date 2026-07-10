import type { ReactElement, ReactNode } from 'react';
import { Alert } from '@shared/ui';
import {
  type ContentTypeKey,
  type Section,
  type SlotFiles,
  type StepKey,
  type UploadSlot,
} from './upload-content-types';
import type { Details } from './upload-details';
import type { SaveStatus } from './use-upload-draft';
import { UploadStepper } from './UploadStepper';
import { UploadTypeStep } from './UploadTypeStep';
import { UploadFileStep } from './UploadFileStep';
import { UploadCurriculumStep } from './UploadCurriculumStep';
import { DetailsStep } from './UploadDetailsStep';
import { UploadPreviewStep } from './UploadPreviewStep';
import styles from './UploadPage.module.css';

export interface UploadWizardProps {
  readonly steps: readonly StepKey[];
  readonly current: number;
  readonly saveStatus: SaveStatus;
  readonly contentType: ContentTypeKey | null;
  readonly onType: (key: ContentTypeKey) => void;
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly onFiles: (files: SlotFiles) => void;
  readonly details: Details;
  readonly onDetailsSubmit: (details: Details) => void;
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
  readonly missing: readonly string[];
  readonly author: string;
  readonly isAdmin: boolean;
  readonly submitError?: string | undefined;
  readonly footer: ReactNode;
}

const StepBody = (props: UploadWizardProps): ReactElement | null => {
  const key = props.steps[props.current];
  if (key === undefined) {
    return null;
  }
  switch (key) {
    case 'type':
      return <UploadTypeStep selected={props.contentType} onSelect={props.onType} />;
    case 'file':
      return (
        <UploadFileStep
          slots={props.slots}
          files={props.files}
          onChange={props.onFiles}
        />
      );
    case 'details':
      return (
        <DetailsStep
          defaults={props.details}
          onSubmit={props.onDetailsSubmit}
          contentType={props.contentType}
        />
      );
    case 'curriculum':
      return (
        <UploadCurriculumStep sections={props.sections} onChange={props.onSections} />
      );
    case 'preview':
      return (
        <UploadPreviewStep
          details={props.details}
          sections={props.contentType === 'course' ? props.sections : []}
          author={props.author}
          missing={props.missing}
        />
      );
  }
};

const SaveStatusPill = ({
  status,
}: {
  readonly status: SaveStatus;
}): ReactElement | null => {
  if (status === 'idle') {
    return null;
  }
  return (
    <span className={styles.savePill}>
      {status === 'saving' ? 'Saving…' : 'Draft saved'}
    </span>
  );
};

/** Type-aware upload wizard shell: progress stepper, the active step, and a footer. */
export const UploadWizard = (props: UploadWizardProps): ReactElement => {
  const activeKey = props.steps[props.current] ?? 'type';
  return (
    <div className={styles.card}>
      <div className={styles.wizardHead}>
        <UploadStepper activeKey={activeKey} done={false} />
        <SaveStatusPill status={props.saveStatus} />
      </div>
      <StepBody {...props} />
      {props.submitError !== undefined ? (
        <Alert tone="error" title="Could not submit">
          {props.submitError}
        </Alert>
      ) : null}
      {props.footer}
    </div>
  );
};
