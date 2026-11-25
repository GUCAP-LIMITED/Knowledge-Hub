import { useEffect, type ReactElement } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { Badge, Button, Spinner, Switch } from '@shared/ui';
import { generateGuid } from '@shared/utils';
import { type ContentDetail, useGetQuiz, type QuizDraftInput } from '@features/content';
import { useDraftEditor } from './use-draft-editor';
import { QuizBuilder } from './QuizBuilder';
import { QuizAnswerKeyViewer } from './QuizAnswerKeyViewer';
import styles from './UploadPage.module.css';

export interface TutorialQuizStudioProps {
  readonly readOnly?: boolean;
  readonly content?: ContentDetail;
}

const EmptyReadOnlyQuiz = (): ReactElement => (
  <div
    style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--color-border)',
      color: 'var(--color-text-muted)',
    }}
  >
    <HelpCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.6 }} />
    <h3
      style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text)' }}
    >
      No Quiz Assessment Attached
    </h3>
    <p style={{ margin: 0, fontSize: '0.9rem' }}>
      This tutorial does not have any quiz questions configured in this revision.
    </p>
  </div>
);

const EmptyAuthorQuiz = ({ onAdd }: { readonly onAdd: () => void }): ReactElement => (
  <div
    style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--color-border)',
      color: 'var(--color-text-muted)',
    }}
  >
    <HelpCircle
      size={36}
      style={{ margin: '0 auto 0.75rem auto', color: 'var(--color-primary)' }}
    />
    <h3
      style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text)' }}
    >
      Add a Quiz Assessment
    </h3>
    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem' }}>
      Reinforce key takeaways with multiple-choice questions right after the tutorial.
    </p>
    <Button type="button" variant="default" size="md" onClick={onAdd}>
      <Plus size={16} /> Add Quiz Assessment
    </Button>
  </div>
);

const ConfiguredAuthorQuiz = ({
  quiz,
  onChange,
  onRemove,
}: {
  readonly quiz: QuizDraftInput;
  readonly onChange: (quiz: QuizDraftInput) => void;
  readonly onRemove: () => void;
}): ReactElement => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      backgroundColor: 'var(--color-surface)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
          {quiz.title || 'Tutorial Quiz Assessment'}
        </h3>
        <p
          style={{
            margin: '0.2rem 0 0 0',
            fontSize: '0.85rem',
            color: 'var(--color-text-subtle)',
          }}
        >
          {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}{' '}
          staged in draft
        </p>
      </div>
      <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
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
          onChange({ ...quiz, isRequired: checked });
        }}
        label="Require quiz submission to complete tutorial"
      />
    </div>

    <QuizBuilder
      quiz={quiz}
      onChange={(updated) => {
        onChange(updated);
      }}
    />
  </div>
);

const TutorialQuizReadOnlyView = ({
  quiz,
}: {
  readonly quiz: QuizDraftInput | null;
}): ReactElement => {
  if (!quiz || quiz.questions.length === 0) {
    return <EmptyReadOnlyQuiz />;
  }
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          Staged Assessment
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {(quiz.upgradeQuiz ?? true) ? (
            <Badge
              tone="warning"
              size="sm"
              title="Creates a new version on approval. Learners will receive a fresh attempt."
            >
              Version Upgrade: v{String(quiz.version ?? 1)} → v
              {String((quiz.version ?? 1) + 1)}
            </Badge>
          ) : (
            <Badge
              tone="neutral"
              size="sm"
              title="In-place edit without version increment. Existing learner attempts and scores are preserved."
            >
              In-Place Edit: v{String(quiz.version ?? 1)}
            </Badge>
          )}
          <Badge tone={(quiz.isRequired ?? true) ? 'primary' : 'neutral'} size="sm">
            {(quiz.isRequired ?? true) ? 'Required to Complete' : 'Optional Practice'}
          </Badge>
        </div>
      </div>
      <QuizAnswerKeyViewer quiz={quiz} />
    </div>
  );
};

const TutorialQuizAuthorView = ({
  quiz,
  onChange,
  onRemove,
  onAdd,
}: {
  readonly quiz: QuizDraftInput | null;
  readonly onChange: (quiz: QuizDraftInput) => void;
  readonly onRemove: () => void;
  readonly onAdd: () => void;
}): ReactElement => {
  if (!quiz || quiz.questions.length === 0) {
    return <EmptyAuthorQuiz onAdd={onAdd} />;
  }
  return <ConfiguredAuthorQuiz quiz={quiz} onChange={onChange} onRemove={onRemove} />;
};

export const TutorialQuizStudio = ({
  readOnly = false,
  content,
}: TutorialQuizStudioProps): ReactElement => {
  const { draftState, updateQuiz } = useDraftEditor();
  const effectiveQuizId = content?.quizId;

  const { data: liveQuiz, isLoading } = useGetQuiz(effectiveQuizId ?? '', {
    enabled: Boolean(effectiveQuizId) && draftState.quiz === undefined,
    includeAnswers: true,
  });

  useEffect(() => {
    if (draftState.quiz === undefined && liveQuiz) {
      updateQuiz(liveQuiz);
    }
  }, [draftState.quiz, liveQuiz, updateQuiz]);

  const handleAddQuiz = (): void => {
    updateQuiz({
      title: 'Tutorial Quiz Assessment',
      isRequired: true,
      passingPercentage: 80,
      isMultipleAttemptAllowed: true,
      questions: [
        {
          id: generateGuid(),
          prompt: '',
          displayOrder: 0,
          options: [
            { id: generateGuid(), text: '', isCorrect: true },
            { id: generateGuid(), text: '', isCorrect: false },
          ],
        },
      ],
    });
  };

  if (isLoading && draftState.quiz === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const currentQuiz =
    draftState.quiz !== undefined ? draftState.quiz : (liveQuiz ?? null);

  if (readOnly) {
    return <TutorialQuizReadOnlyView quiz={currentQuiz} />;
  }

  return (
    <TutorialQuizAuthorView
      quiz={currentQuiz}
      onChange={updateQuiz}
      onRemove={() => {
        updateQuiz(null);
      }}
      onAdd={handleAddQuiz}
    />
  );
};
