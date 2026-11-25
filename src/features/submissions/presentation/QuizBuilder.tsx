import { type ReactElement } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button, Switch } from '@shared/ui';
import { type QuizConfig, type QuizQuestion } from './upload-content-types';
import { QuestionCard } from './QuestionCard';
import {
  canUpgradeQuiz,
  useQuizBuilder,
  type QuizBuilderProps,
} from './use-quiz-builder';
import styles from './QuizBuilder.module.css';

export type { QuizBuilderProps };

const parsePassingPercentage = (value: string): number => {
  const val = parseFloat(value);
  if (Number.isNaN(val)) {
    return 80;
  }
  return Math.min(100, Math.max(1, val));
};

interface QuizAssessmentSettingsProps {
  readonly quiz: QuizConfig;
  readonly passingPercentage: number;
  readonly isMultipleAttemptAllowed: boolean;
  readonly onUpdate: (quiz: QuizConfig) => void;
}

const QuizAssessmentSettings = ({
  quiz,
  passingPercentage,
  isMultipleAttemptAllowed,
  onUpdate,
}: QuizAssessmentSettingsProps): ReactElement => (
  <div className={styles.settingsGrid}>
    <div className={styles.settingCard}>
      <label htmlFor="passing-score-input" className={styles.settingLabel}>
        Passing Score (%)
      </label>
      <div className={styles.inputWithSuffix}>
        <input
          id="passing-score-input"
          type="number"
          min={1}
          max={100}
          step="0.5"
          value={passingPercentage}
          onChange={(e) => {
            onUpdate({
              ...quiz,
              passingPercentage: parsePassingPercentage(e.target.value),
            });
          }}
          className={styles.percentageInput}
        />
        <span className={styles.suffix}>%</span>
      </div>
      <p className={styles.settingHint}>
        Minimum percentage to pass (decimals supported, e.g. 80.5%).
      </p>
    </div>

    <div className={styles.settingCard}>
      <div className={styles.toggleRow}>
        <div>
          <span className={styles.settingLabel}>Allow Multiple Attempts</span>
          <p className={styles.settingHint}>
            {isMultipleAttemptAllowed
              ? 'Learners can retake if they do not pass.'
              : 'Single attempt only; locked after submission.'}
          </p>
        </div>
        <Switch
          checked={isMultipleAttemptAllowed}
          onChange={(checked) => {
            onUpdate({ ...quiz, isMultipleAttemptAllowed: checked });
          }}
          label="Allow multiple attempts"
        />
      </div>
    </div>

    {canUpgradeQuiz(quiz) && (
      <div className={styles.settingCard}>
        <div className={styles.toggleRow}>
          <div>
            <span className={styles.settingLabel}>Upgrade Quiz Version</span>
            <p className={styles.settingHint}>
              {(quiz.upgradeQuiz ?? true)
                ? quiz.version
                  ? `Upgrades to v${String(quiz.version + 1)}. Learners who already took this quiz get a fresh attempt.`
                  : 'Creates a new version. Learners who already took this quiz get a fresh attempt.'
                : quiz.version
                  ? `Keeps v${String(quiz.version)}. Minor in-place edit; existing learner attempts and scores are preserved.`
                  : 'Applies minor in-place edits (e.g. typos) without creating a new version.'}
            </p>
          </div>
          <Switch
            checked={quiz.upgradeQuiz ?? true}
            onChange={(checked) => {
              onUpdate({ ...quiz, upgradeQuiz: checked });
            }}
            label="Upgrade quiz version"
          />
        </div>
      </div>
    )}
  </div>
);

interface QuestionsListProps {
  readonly questions: readonly QuizQuestion[];
  readonly sensors: ReturnType<typeof useQuizBuilder>['sensors'];
  readonly onDragEnd: (event: DragEndEvent) => void;
  readonly onUpdateQuestion: (index: number, question: QuizQuestion) => void;
  readonly onRemoveQuestion: (index: number) => void;
  readonly onAddQuestion: () => void;
}

const QuestionsList = ({
  questions,
  sensors,
  onDragEnd,
  onUpdateQuestion,
  onRemoveQuestion,
  onAddQuestion,
}: QuestionsListProps): ReactElement => (
  <>
    <div className={styles.quizBuilderHeader} style={{ marginTop: '0.5rem' }}>
      <h3 className={styles.quizBuilderTitle}>Quiz Questions</h3>
    </div>

    {questions.length === 0 ? (
      <div className={styles.emptyState}>
        <p style={{ margin: 0, fontWeight: 500 }}>No quiz questions yet.</p>
        <span style={{ fontSize: '0.875rem' }}>
          Click &ldquo;Add Question&rdquo; below to create your first question and
          options.
        </span>
      </div>
    ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={questions.map((q, idx) => q.id ?? `q-${String(idx)}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.questionsContainer}>
            {questions.map((question, qIndex) => (
              <QuestionCard
                key={question.id ?? `q-${String(qIndex)}`}
                question={question}
                qIndex={qIndex}
                onChange={(q) => {
                  onUpdateQuestion(qIndex, q);
                }}
                onRemove={() => {
                  onRemoveQuestion(qIndex);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )}

    <Button variant="outline" size="lg" fullWidth onClick={onAddQuestion}>
      <Plus aria-hidden="true" />
      Add Question
    </Button>
  </>
);

export const QuizBuilder = (props: QuizBuilderProps): ReactElement => {
  const {
    quiz,
    passingPercentage,
    isMultipleAttemptAllowed,
    sensors,
    updateQuiz,
    handleDragEnd,
    addQuestion,
    updateQuestion,
    removeQuestion,
  } = useQuizBuilder(props);

  return (
    <div className={styles.quizBuilder}>
      <div className={styles.quizBuilderHeader}>
        <h3 className={styles.quizBuilderTitle}>Quiz Assessment Settings</h3>
      </div>

      <QuizAssessmentSettings
        quiz={quiz}
        passingPercentage={passingPercentage}
        isMultipleAttemptAllowed={isMultipleAttemptAllowed}
        onUpdate={updateQuiz}
      />

      <QuestionsList
        questions={quiz.questions}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onUpdateQuestion={updateQuestion}
        onRemoveQuestion={removeQuestion}
        onAddQuestion={addQuestion}
      />
    </div>
  );
};
