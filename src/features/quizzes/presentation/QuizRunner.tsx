/* eslint-disable complexity, max-lines-per-function */
import { useState, type ReactElement, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useQuizzes, useSubmitQuiz } from './use-quizzes';
import {
  useQuizLearnerStatus,
  quizLearnerStatusQueryKey,
} from './use-quiz-learner-status';
import { useQuizProgressStore } from './use-quiz-progress';
import { QuizContent } from './QuizContent';
import type { QuizResult, QuizAnswers } from '../domain';

// Using the same fallback styles as MediaViewer for consistency
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';

interface QuizFallbackProps {
  readonly message: string;
  readonly isError?: boolean;
}

const QuizFallback = ({ message, isError = false }: QuizFallbackProps): ReactElement => (
  <div className={styles.fallback}>
    <AlertCircle
      size={40}
      className={isError ? 'text-destructive' : undefined}
      style={{
        marginBottom: '1rem',
        color: isError ? undefined : 'var(--color-text-muted)',
      }}
    />
    <p className={styles.fallbackText}>{message}</p>
  </div>
);

export interface QuizRunnerProps {
  readonly quizId: string | null;
  readonly lessonId: string | null;
  readonly onPassed?: () => void;
  readonly onResultChange?: (result: QuizResult | null) => void;
}

/**
 * A drop-in quiz player for use in modals (like the course curriculum lesson player).
 * Manages the state of the active quiz, grading, and recording progress.
 */
export const QuizRunner = ({
  quizId,
  lessonId,
  onPassed,
  onResultChange,
}: QuizRunnerProps): ReactElement => {
  const queryClient = useQueryClient();
  const {
    data: quizzes,
    isLoading: isQuizLoading,
    isError,
    error,
  } = useQuizzes(quizId ?? '');
  const { data: learnerStatus, isLoading: isStatusLoading } =
    useQuizLearnerStatus(quizId);
  const submit = useSubmitQuiz();

  const [localResult, setLocalResult] = useState<QuizResult | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string[]> | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const markPassed = useQuizProgressStore((s) => s.markPassed);

  // Reset state when quiz changes
  useEffect(() => {
    setLocalResult(null);
    setLocalAnswers(null);
    setIsRetaking(false);
    setAttempt(1);
  }, [quizId]);

  // Server progress hydration: sync passed status across browsers/devices
  // Once complete, always complete: preserve course lesson completion if learner has ever passed
  useEffect(() => {
    if (
      (learnerStatus?.status === 'passed' || learnerStatus?.hasEverPassed) &&
      lessonId
    ) {
      markPassed(lessonId);
    }
  }, [learnerStatus?.status, learnerStatus?.hasEverPassed, lessonId, markPassed]);

  const quiz = quizzes?.[0];

  const handleSubmit = (answers: QuizAnswers): void => {
    if (!quiz) {
      return;
    }
    submit.mutate(
      { quizId: quiz.id, answers },
      {
        onSuccess: (res) => {
          setLocalResult(res);
          if (res.answers) {
            setLocalAnswers(res.answers);
          } else {
            const mappedAnswers: Record<string, string[]> = {};
            for (const question of quiz.questions) {
              const selectedIndexes = answers[question.id] ?? [];
              mappedAnswers[question.id] = selectedIndexes
                .map((idx) => question.optionIds[idx])
                .filter((id): id is string => typeof id === 'string');
            }
            setLocalAnswers(mappedAnswers);
          }
          setIsRetaking(false);
          void queryClient.invalidateQueries({
            queryKey: quizLearnerStatusQueryKey(quiz.id),
          });
          if (res.passed) {
            if (lessonId) {
              markPassed(lessonId);
            }
            onPassed?.();
          }
        },
      },
    );
  };

  const handleRetake = (): void => {
    setIsRetaking(true);
    setLocalResult(null);
    setLocalAnswers(null);
    setAttempt((a) => a + 1);
  };

  // Active result: local submission takes precedence, otherwise server's latest result if already taken and not retaking
  const activeResult =
    localResult ??
    (!isRetaking && learnerStatus && learnerStatus.status !== 'not_attempted'
      ? learnerStatus.latestResult
      : null);

  useEffect(() => {
    onResultChange?.(activeResult);
  }, [activeResult, onResultChange]);

  if (!quizId) {
    return <QuizFallback message="No quiz available for this lesson." />;
  }

  if (isQuizLoading || isStatusLoading) {
    return <Skeleton width="100%" height={400} radius={12} />;
  }

  if (isError || !quizzes) {
    return <QuizFallback message={error?.message ?? 'Failed to load quiz'} isError />;
  }

  if (!quiz) {
    return <QuizFallback message="No quiz available for this lesson." />;
  }

  const activeAnswers =
    localAnswers ?? activeResult?.answers ?? learnerStatus?.latestAnswers ?? null;

  return (
    <QuizContent
      quiz={quiz}
      result={activeResult}
      userAnswers={activeAnswers}
      canAttempt={learnerStatus?.canAttempt ?? true}
      isQuizUpdated={learnerStatus?.isQuizUpdatedSinceLastAttempt ?? false}
      attempt={attempt}
      isSubmitting={submit.isPending}
      certificateReady={false} // Certificates are handled at the course level
      isPostSubmission={Boolean(localResult)}
      onSubmit={handleSubmit}
      onRetake={handleRetake}
    />
  );
};
