import type { Result } from '@core/result';
import type { QuizError } from '../errors/quiz-errors';
import type { Quiz, QuizAnswers } from '../entities/quiz';
import type { QuizResult } from '../value-objects/quiz-result';
import type { QuizLearnerStatus } from '../value-objects/quiz-learner-status';

/**
 * Port to quiz storage. A piece of content can carry several quizzes. The domain states the
 * contract in its own terms (`Quiz`); storage or HTTP details live in an infrastructure
 * implementation. Dependency Inversion seam.
 */
export interface QuizGateway {
  /** Every quiz attached to a piece of content (may be empty). */
  listByContent(contentId: string): Promise<Result<readonly Quiz[], QuizError>>;

  /** A single quiz by its id, or `null` when it no longer exists. */
  getById(quizId: string): Promise<Result<Quiz | null, QuizError>>;

  /** Persist a quiz (create or replace) and return it. */
  save(quiz: Quiz): Promise<Result<Quiz, QuizError>>;

  /** Remove a quiz by its id. */
  remove(quizId: string): Promise<Result<void, QuizError>>;

  /** Grade learner answers and return the result. */
  submit(
    quizId: string,
    answers: QuizAnswers,
    quiz: Quiz,
  ): Promise<Result<QuizResult, QuizError>>;

  /** Get the current learner's submission status, latest attempt, and saved answers for a quiz. */
  getMyStatus(quizId: string): Promise<Result<QuizLearnerStatus, QuizError>>;
}
