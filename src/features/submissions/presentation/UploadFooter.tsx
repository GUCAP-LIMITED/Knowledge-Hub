import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import type { StepKey } from './upload-content-types';
import { SelectionActionBar } from './SelectionActionBar';
import styles from './UploadPage.module.css';

export interface UploadFooterProps {
  readonly stepKey: StepKey | undefined;
  readonly isFirst: boolean;
  readonly fileReady: boolean;
  /** False when required details (description, category) are still missing on the preview step. */
  readonly canPublish: boolean;
  readonly isAdmin: boolean;
  readonly isSubmitting: boolean;
  readonly selectedTypeLabel: string | null;
  readonly onBack: () => void;
  readonly onContinue: () => void;
  readonly onSubmit: () => void;
}

const PrimaryButton = ({
  stepKey,
  fileReady,
  canPublish,
  isAdmin,
  isSubmitting,
  onContinue,
  onSubmit,
}: UploadFooterProps): ReactElement | null => {
  switch (stepKey) {
    case 'file':
      return (
        <Button disabled={!fileReady} onClick={onContinue}>
          Continue
        </Button>
      );
    case 'details':
      return (
        <Button type="submit" form="upload-details">
          Continue
        </Button>
      );
    case 'curriculum':
      return <Button onClick={onContinue}>Continue</Button>;
    case 'preview':
      return (
        <Button disabled={!canPublish} isLoading={isSubmitting} onClick={onSubmit}>
          {isAdmin ? 'Publish now' : 'Submit for review'}
        </Button>
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
