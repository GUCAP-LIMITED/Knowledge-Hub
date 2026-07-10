import type { ReactElement } from 'react';
import type { Quiz, QuizAnswers, QuizResult } from '../domain';
import { QuizRunner } from './QuizRunner';
import { QuizResultView } from './QuizResultView';

export interface QuizContentProps {
  readonly quiz: Quiz;
  readonly result: QuizResult | null;
  readonly attempt: number;
  readonly isSubmitting: boolean;
  readonly rewatchLabel: string;
  readonly onSubmit: (answers: QuizAnswers) => void;
  readonly onRetake: () => void;
  readonly onRewatch: () => void;
}

/** Learner branch of the quiz: the graded result once submitted, otherwise the runner. */
export const QuizContent = ({
  quiz,
  result,
  attempt,
  isSubmitting,
  rewatchLabel,
  onSubmit,
  onRetake,
  onRewatch,
}: QuizContentProps): ReactElement =>
  result !== null ? (
    <QuizResultView
      result={result}
      rewatchLabel={rewatchLabel}
      onRewatch={onRewatch}
      onRetake={onRetake}
    />
  ) : (
    <QuizRunner
      key={attempt}
      quiz={quiz}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
