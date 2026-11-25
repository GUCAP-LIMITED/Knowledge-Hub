import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import type { StepKey } from './upload-content-types';
import { SelectionActionBar } from './SelectionActionBar';
import styles from './UploadPage.module.css';

export interface UploadFooterProps {
  readonly stepKey: StepKey | undefined;
  readonly isFirst: boolean;
  readonly isAdmin: boolean;
  readonly isSubmitting: boolean;
  readonly selectedTypeLabel: string | null;
  /** False when the caller lacks `Submissions.Create` — gates the type step's Continue action. */
  readonly canCreateSubmission: boolean;
  readonly onBack: () => void;
  readonly onContinue: () => void;
  readonly onSubmit: () => void;
}

/**
 * Never disabled for missing items: a blocked click is how the user finds out what is required
 * (the flow marks and shakes the empty fields), which a dead button could not explain.
 */
const PublishButton = ({
  isAdmin,
  isSubmitting,
  onSubmit,
}: {
  readonly isAdmin: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
}): ReactElement => (
  <Button isLoading={isSubmitting} onClick={onSubmit}>
    {isAdmin ? 'Publish now' : 'Submit for review'}
  </Button>
);

const PrimaryButton = ({
  stepKey,
  isAdmin,
  isSubmitting,
  onContinue,
  onSubmit,
}: UploadFooterProps): ReactElement | null => {
  switch (stepKey) {
    case 'file':
      return <Button onClick={onContinue}>Continue</Button>;
    case 'details':
      return (
        <Button type="submit" form="upload-details">
          Continue
        </Button>
      );
    case 'curriculum':
      return <Button onClick={onContinue}>Continue</Button>;
    case 'preview':
    case 'studio':
      return (
        <PublishButton
          isAdmin={isAdmin}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );
    case 'type':
    case undefined:
    default:
      return null;
  }
};

/** Footer navigation for the upload wizard — back plus the step-appropriate primary action. */
export const UploadFooter = (props: UploadFooterProps): ReactElement => {
  if (props.stepKey === 'type') {
    return (
      <SelectionActionBar
        selectedLabel={props.selectedTypeLabel}
        canCreate={props.canCreateSubmission}
        onContinue={props.onContinue}
      />
    );
  }
  return (
    <div className={styles.footer}>
      {props.isFirst ? null : (
        <Button variant="ghost" onClick={props.onBack}>
          Back
        </Button>
      )}
      <PrimaryButton {...props} />
    </div>
  );
};
