import type { Result } from '@core/result';
import type { QuizError } from '../errors/quiz-errors';
import type { Quiz } from '../entities/quiz';

/**
 * Port to quiz storage. The domain states the contract in its own terms (`Quiz`); storage or HTTP
 * details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface QuizGateway {
  /** Fetch the quiz attached to a piece of content, or `null` if none exists. */
  findByContent(contentId: string): Promise<Result<Quiz | null, QuizError>>;

  /** Persist a quiz (create or replace) and return it. */
  save(quiz: Quiz): Promise<Result<Quiz, QuizError>>;
}
