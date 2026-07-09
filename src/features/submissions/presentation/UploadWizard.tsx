import type { ReactElement, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Alert } from '@shared/ui';
import { cn } from '@shared/utils';
import {
  type ContentTypeKey,
  type Section,
  type SlotFiles,
  type StepKey,
  type UploadSlot,
} from './upload-content-types';
import type { Details } from './upload-details';
import { UploadTypeStep } from './UploadTypeStep';
import { UploadFileStep } from './UploadFileStep';
import { UploadCurriculumStep } from './UploadCurriculumStep';
import { DetailsStep } from './UploadDetailsStep';
import { ReviewSummary } from './UploadSteps';
import styles from './UploadPage.module.css';

const STEP_LABELS: Record<StepKey, string> = {
  type: 'Type',
  file: 'Upload',
  details: 'Details',
  curriculum: 'Curriculum',
  review: 'Review',
};

const Stepper = ({
  steps,
  current,
}: {
  readonly steps: readonly StepKey[];
  readonly current: number;
}): ReactElement => (
  <div className={styles.stepper}>
    {steps.map((key, index) => (
      <div key={key} className={styles.step}>
        <span className={cn(styles.dot, current >= index && styles.dotActive)}>
          {current > index ? <Check size={14} aria-hidden="true" /> : index + 1}
        </span>
        <span
          className={cn(styles.stepLabel, current >= index && styles.stepLabelActive)}
        >
          {STEP_LABELS[key]}
        </span>
      </div>
    ))}
  </div>
);

export interface UploadWizardProps {
  readonly steps: readonly StepKey[];
  readonly current: number;
  readonly contentType: ContentTypeKey | null;
  readonly onType: (key: ContentTypeKey) => void;
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly onFiles: (files: SlotFiles) => void;
  readonly fileCount: number;
  readonly details: Details;
  readonly onDetailsSubmit: (details: Details) => void;
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
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
      return <DetailsStep defaults={props.details} onSubmit={props.onDetailsSubmit} />;
    case 'curriculum':
      return (
        <UploadCurriculumStep sections={props.sections} onChange={props.onSections} />
      );
    case 'review':
      return (
        <ReviewSummary
          details={props.details}
          fileCount={props.fileCount}
          isAdmin={props.isAdmin}
          sections={props.contentType === 'course' ? props.sections : null}
        />
      );
  }
};

/** Type-aware upload wizard shell: progress stepper, the active step, and a footer. */
export const UploadWizard = (props: UploadWizardProps): ReactElement => (
  <div className={styles.card}>
    <Stepper steps={props.steps} current={props.current} />
    <StepBody {...props} />
    {props.submitError !== undefined ? (
      <Alert tone="error" title="Could not submit">
        {props.submitError}
      </Alert>
    ) : null}
    {props.footer}
  </div>
);
