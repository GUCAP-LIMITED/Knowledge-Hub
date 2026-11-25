import { type ReactElement } from 'react';
import { HelpCircle } from 'lucide-react';
import { Badge, Button, Switch } from '@shared/ui';
import { generateGuid } from '@shared/utils';
import {
  type ContentTypeKey,
  type QuizConfig,
  type SlotFiles,
  type UploadSlot,
  type VideoPlaylistItem,
} from './upload-content-types';
import { QuizBuilder } from './QuizBuilder';
import { SlotCard } from './UploadSlotCard';
import { TutorialVideoPlaylistBuilder } from './TutorialVideoPlaylistBuilder';
import styles from './UploadPage.module.css';

const TutorialQuizConfiguredCard = ({
  quiz,
  onQuizChange,
}: {
  readonly quiz: QuizConfig;
  readonly onQuizChange: (quiz: QuizConfig | null) => void;
}): ReactElement => (
  <div className={styles.tutorialQuizCard}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          {quiz.title || 'Tutorial Quiz'}
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
          {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}{' '}
          configured
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => {
          onQuizChange(null);
        }}
      >
        Remove Quiz
      </Button>
    </div>
    <div className={styles.quizRequirementToggle}>
      <div className={styles.toggleInfo}>
        <div className={styles.toggleLabelRow}>
          <span className={styles.toggleTitle}>Require Quiz Submission to Complete</span>
          <Badge tone={(quiz.isRequired ?? true) ? 'primary' : 'neutral'} size="sm">
            {(quiz.isRequired ?? true) ? 'Mandatory' : 'Optional Practice'}
          </Badge>
        </div>
        <span className={styles.toggleDesc}>
          When enabled, learners must submit this quiz in order to complete this tutorial.
        </span>
      </div>
      <Switch
        checked={quiz.isRequired ?? true}
        onChange={(checked) => {
          onQuizChange({ ...quiz, isRequired: checked });
        }}
        label="Require quiz submission to complete tutorial"
      />
    </div>
    <QuizBuilder quiz={quiz} onChange={onQuizChange} />
  </div>
);

const TutorialQuizEmptyCard = ({
  onQuizChange,
}: {
  readonly onQuizChange: (quiz: QuizConfig | null) => void;
}): ReactElement => (
  <div className={styles.quizEmptyPlaceholder}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <HelpCircle size={24} style={{ color: 'var(--color-primary)' }} />
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
          Add a Quiz Assessment
        </p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
          Reinforce key takeaways with multiple-choice questions right after the tutorial.
        </p>
      </div>
    </div>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        onQuizChange({
          title: 'Tutorial Quiz Assessment',
          isRequired: true,
          passingPercentage: 80,
          isMultipleAttemptAllowed: true,
          questions: [
            {
              id: generateGuid(),
              prompt: '',
              options: [
                { id: generateGuid(), text: '', isCorrect: true },
                { id: generateGuid(), text: '', isCorrect: false },
              ],
            },
          ],
        });
      }}
    >
      + Add Quiz
    </Button>
  </div>
);

const TutorialQuizBuilderCard = ({
  quiz,
  onQuizChange,
}: {
  readonly quiz?: QuizConfig | null | undefined;
  readonly onQuizChange: (quiz: QuizConfig | null) => void;
}): ReactElement =>
  quiz && quiz.questions.length > 0 ? (
    <TutorialQuizConfiguredCard quiz={quiz} onQuizChange={onQuizChange} />
  ) : (
    <TutorialQuizEmptyCard onQuizChange={onQuizChange} />
  );

export interface UploadFileStepProps {
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly onChange: (files: SlotFiles) => void;
  readonly videoPlaylist?: readonly VideoPlaylistItem[] | undefined;
  readonly onVideoPlaylistChange?:
    | ((playlist: readonly VideoPlaylistItem[]) => void)
    | undefined;
  readonly contentType?: ContentTypeKey | null | undefined;
  readonly quiz?: QuizConfig | null | undefined;
  readonly onQuizChange?: ((quiz: QuizConfig | null) => void) | undefined;
}

/** Type-aware upload step — dropzone cards and optional tutorial quiz assessment. */
export const UploadFileStep = ({
  slots,
  files,
  onChange,
  videoPlaylist = [],
  onVideoPlaylistChange,
  contentType,
  quiz = null,
  onQuizChange,
}: UploadFileStepProps): ReactElement => {
  if (contentType === 'tutorial') {
    const thumbSlot = slots.find((s) => s.id === 'thumbnail');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Section 1: Thumbnail (Top, full-width) */}
        {thumbSlot ? (
          <div>
            <SlotCard
              slot={thumbSlot}
              files={files[thumbSlot.id] ?? []}
              onChange={(next) => {
                onChange({ ...files, [thumbSlot.id]: next });
              }}
            />
          </div>
        ) : null}

        {/* Section 2: Video Playlist Studio (Below) */}
        {onVideoPlaylistChange ? (
          <TutorialVideoPlaylistBuilder
            playlist={videoPlaylist}
            onChange={onVideoPlaylistChange}
          />
        ) : null}

        {/* Section 3: Quiz Assessment (Optional) */}
        {onQuizChange ? (
          <div className={styles.tutorialQuizSection}>
            <div className={styles.slotHead}>
              <span className={styles.slotLabel}>Quiz Assessment (Optional)</span>
              <span className={styles.slotAccept}>
                Reinforce learning with a quick quiz
              </span>
            </div>
            <TutorialQuizBuilderCard quiz={quiz} onQuizChange={onQuizChange} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.slotGrid}>
        {slots.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            files={files[slot.id] ?? []}
            onChange={(next) => {
              onChange({ ...files, [slot.id]: next });
            }}
          />
        ))}
      </div>
    </div>
  );
};
