import type { QuizResult, QuizStatus } from './quiz-result';

export interface QuizLearnerStatus {
  readonly status: QuizStatus;
  readonly hasEverPassed: boolean;
  readonly attemptCount: number;
  readonly versionAttemptCount: number;
  readonly canAttempt: boolean;
  readonly isQuizUpdatedSinceLastAttempt: boolean;
  /** null when status is 'not_attempted' */
  readonly latestResult: QuizResult | null;
  /** questionId -> selected optionIds for read-only answer review */
  readonly latestAnswers: Record<string, string[]> | null;
}
