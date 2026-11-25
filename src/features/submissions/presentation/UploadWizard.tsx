import type { ReactElement, ReactNode } from 'react';
import { Alert } from '@shared/ui';
import {
  type ContentTypeKey,
  type QuizConfig,
  type Section,
  type SlotFiles,
  type StepKey,
  type UploadSlot,
  type VideoPlaylistItem,
} from './upload-content-types';
import type { Details } from './upload-details';
import type { SaveStatus } from './use-upload-draft';
import { UploadStepper } from './UploadStepper';
import { UploadTypeStep } from './UploadTypeStep';
import { UploadFileStep } from './UploadFileStep';
import { DetailsStep } from './UploadDetailsStep';
import { UploadPreviewStep } from './UploadPreviewStep';
import { CourseStudioStep } from './CourseStudioStep';
import { UploadCancelledNotice } from './UploadCancelledNotice';
import { SubmitAttemptContext } from './submit-attempt-context';
import { useBlockedAttemptToast } from './use-blocked-attempt-toast';
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
  readonly videoPlaylist?: readonly VideoPlaylistItem[] | undefined;
  readonly onVideoPlaylistChange?:
    | ((playlist: readonly VideoPlaylistItem[]) => void)
    | undefined;
  readonly details: Details;
  readonly onDetailsSubmit: (details: Details) => void;
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
  readonly quiz?: QuizConfig | null | undefined;
  readonly onQuizChange?: ((quiz: QuizConfig | null) => void) | undefined;
  readonly missing: readonly string[];
  /** Blocked continue/publish clicks so far; drives the required-field markers. */
  readonly attempt: number;
  readonly author: string;
  readonly isAdmin: boolean;
  readonly submitError?: string | undefined;
  /** The user cancelled the upload — shown as a calm notice, not an error. */
  readonly wasCancelled?: boolean | undefined;
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
          videoPlaylist={props.videoPlaylist}
          onVideoPlaylistChange={props.onVideoPlaylistChange}
          contentType={props.contentType}
          quiz={props.quiz}
          onQuizChange={props.onQuizChange}
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
      return null;
    case 'preview':
      return (
        <UploadPreviewStep
          details={props.details}
          sections={props.contentType === 'course' ? props.sections : []}
          quiz={props.quiz}
          author={props.author}
          missing={props.missing}
        />
      );
    case 'studio':
      return (
        <CourseStudioStep
          slots={props.slots}
          files={props.files}
          onFiles={props.onFiles}
          sections={props.sections}
          onSections={props.onSections}
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
  useBlockedAttemptToast(props.attempt, props.missing);
  return (
    <div className={styles.card}>
      {props.contentType !== null ? (
        <div className={styles.wizardHead}>
          <UploadStepper steps={props.steps} activeKey={activeKey} done={false} />
          <SaveStatusPill status={props.saveStatus} />
        </div>
      ) : null}
      <SubmitAttemptContext.Provider value={props.attempt}>
        <StepBody {...props} />
      </SubmitAttemptContext.Provider>
      {props.wasCancelled === true ? <UploadCancelledNotice /> : null}
      {props.submitError !== undefined ? (
        <Alert tone="error" title="Could not submit">
          {props.submitError}
        </Alert>
      ) : null}
      {props.footer}
    </div>
  );
};
