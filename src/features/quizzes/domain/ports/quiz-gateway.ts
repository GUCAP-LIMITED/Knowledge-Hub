import type { Result } from '@core/result';
import type { QuizError } from '../errors/quiz-errors';
import type { Quiz } from '../entities/quiz';

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
}
