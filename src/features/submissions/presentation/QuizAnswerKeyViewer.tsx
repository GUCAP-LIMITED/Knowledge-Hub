/* eslint-disable max-lines-per-function */
import type { ReactElement } from 'react';
import {
  Award,
  CheckCircle2,
  CheckSquare,
  HelpCircle,
  RotateCcw,
  FileQuestion,
  AlertTriangle,
} from 'lucide-react';
import { Alert } from '@shared/ui';
import { cn } from '@shared/utils';
import type { QuizDraftInput } from '@features/content';
import styles from './QuizAnswerKeyViewer.module.css';

export interface QuizAnswerKeyViewerProps {
  readonly quiz: QuizDraftInput | null | undefined;
}

interface MetricsRibbonProps {
  readonly passingPercentage: number;
  readonly totalQuestions: number;
  readonly singleChoiceCount: number;
  readonly multiChoiceCount: number;
  readonly isMultipleAttemptAllowed: boolean;
}

const MetricsRibbon = ({
  passingPercentage,
  totalQuestions,
  singleChoiceCount,
  multiChoiceCount,
  isMultipleAttemptAllowed,
}: MetricsRibbonProps): ReactElement => (
  <div className={styles.metricsGrid}>
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} aria-hidden>
        <Award size={18} />
      </div>
      <div className={styles.metricInfo}>
        <span className={styles.metricLabel}>Passing Score</span>
        <span className={styles.metricValue}>{String(passingPercentage)}%</span>
        <span className={styles.metricHelper}>Required to pass lesson</span>
      </div>
    </div>

    <div className={styles.metricCard}>
      <div className={styles.metricIcon} aria-hidden>
        <HelpCircle size={18} />
      </div>
      <div className={styles.metricInfo}>
        <span className={styles.metricLabel}>Total Questions</span>
        <span className={styles.metricValue}>
          {String(totalQuestions)} Question{totalQuestions === 1 ? '' : 's'}
        </span>
        <span className={styles.metricHelper}>
          {String(singleChoiceCount)} Single, {String(multiChoiceCount)} Multi
        </span>
      </div>
    </div>

    <div className={styles.metricCard}>
      <div className={styles.metricIcon} aria-hidden>
        <RotateCcw size={18} />
      </div>
      <div className={styles.metricInfo}>
        <span className={styles.metricLabel}>Attempts Policy</span>
        <span className={styles.metricValue}>
          {isMultipleAttemptAllowed ? 'Multiple Attempts' : 'Single Attempt'}
        </span>
        <span className={styles.metricHelper}>
          {isMultipleAttemptAllowed
            ? 'Retakes allowed upon failure'
            : 'Single submission only'}
        </span>
      </div>
    </div>
  </div>
);

export const QuizAnswerKeyViewer = ({ quiz }: QuizAnswerKeyViewerProps): ReactElement => {
  if (!quiz?.questions || quiz.questions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <HelpCircle size={36} className={styles.emptyIcon} aria-hidden />
        <p className={styles.emptyText}>No quiz questions defined</p>
        <p className={styles.emptySubtext}>
          This quiz lesson does not have any questions configured yet.
        </p>
      </div>
    );
  }

  const passingPercentage = quiz.passingPercentage ?? 80;
  const isMultipleAttemptAllowed = quiz.isMultipleAttemptAllowed ?? true;
  const totalQuestions = quiz.questions.length;
  const multiChoiceCount = quiz.questions.filter(
    (q) => q.options.filter((o) => o.isCorrect).length > 1,
  ).length;
  const singleChoiceCount = quiz.questions.filter(
    (q) => q.options.filter((o) => o.isCorrect).length === 1,
  ).length;
  const missingCount = quiz.questions.filter(
    (q) => !q.options.some((o) => o.isCorrect),
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerTopRow}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIconBadge} aria-hidden>
              <FileQuestion size={18} />
            </div>
            <div>
              <h4 className={styles.title}>
                {quiz.title ? quiz.title : 'Quiz Assessment'}{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                  ({String(totalQuestions)} Question{totalQuestions === 1 ? '' : 's'})
                </span>
              </h4>
              <p className={styles.subtitle}>
                Review question configurations, passing criteria, and designated answer
                keys
              </p>
            </div>
          </div>

          <span className={styles.modeBadge}>
            <CheckCircle2 size={13} aria-hidden /> Answer Key Mode
          </span>
        </div>

        <MetricsRibbon
          passingPercentage={passingPercentage}
          totalQuestions={totalQuestions}
          singleChoiceCount={singleChoiceCount}
          multiChoiceCount={multiChoiceCount}
          isMultipleAttemptAllowed={isMultipleAttemptAllowed}
        />
      </div>

      {missingCount > 0 ? (
        <Alert tone="warning" title="Incomplete Questions Detected">
          {String(missingCount)} question{missingCount === 1 ? '' : 's'} in this quiz have
          no correct answer option selected. Learners will not be able to score points on
          them.
        </Alert>
      ) : null}

      <div className={styles.questionsList}>
        {[...quiz.questions]
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((question, qIdx) => {
            const correctOptions = question.options.filter((o) => o.isCorrect);
            const isMulti = correctOptions.length > 1;
            const hasCorrect = correctOptions.length > 0;

            return (
              <div
                key={question.id ?? `q-${String(qIdx)}`}
                className={styles.questionCard}
              >
                <div className={styles.questionHeader}>
                  <div className={styles.questionBadgeRow}>
                    <span className={styles.questionNumberTag}>
                      Question {String(qIdx + 1)}
                    </span>
                    <span className={styles.typeBadge}>
                      {isMulti ? (
                        <>
                          <CheckSquare size={13} aria-hidden /> Multiple Choice (Select
                          All)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} aria-hidden /> Single Choice
                        </>
                      )}
                    </span>
                  </div>

                  {hasCorrect ? (
                    <span className={styles.correctCountHint}>
                      {String(correctOptions.length)} correct answer
                      {correctOptions.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: 'var(--color-danger)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle
                        size={12}
                        style={{ display: 'inline', marginRight: '0.25rem' }}
                      />
                      No correct answer
                    </span>
                  )}
                </div>

                <p className={styles.questionPrompt}>{question.prompt}</p>

                <div className={styles.optionsList}>
                  {question.options.map((option, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={option.id ?? `opt-${String(oIdx)}`}
                        className={cn(
                          styles.optionRow,
                          option.isCorrect && styles.optionRowCorrect,
                        )}
                      >
                        <div className={styles.optionLeft}>
                          <span
                            className={cn(
                              styles.optionLetterBadge,
                              option.isCorrect && styles.optionLetterBadgeCorrect,
                            )}
                          >
                            {letter}
                          </span>
                          <span
                            className={cn(
                              styles.optionText,
                              option.isCorrect && styles.optionTextCorrect,
                            )}
                          >
                            {option.text}
                          </span>
                        </div>

                        {option.isCorrect ? (
                          <span className={styles.correctBadge}>
                            <CheckCircle2 size={13} aria-hidden /> Correct Answer
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
