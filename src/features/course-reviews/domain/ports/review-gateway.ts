import type { Result } from '@core/result';
import type { ReviewError } from '../errors/review-errors';
import type { Review } from '../entities/review';

/** Port to the reviews store. States the contract in domain terms; storage lives in infrastructure. */
export interface ReviewGateway {
  /** Every review (moderation view). */
  list(): Promise<Result<readonly Review[], ReviewError>>;

  /** Reviews for a single course. */
  listByCourse(courseId: string): Promise<Result<readonly Review[], ReviewError>>;

  /** Fetch a single review by id (returns null when absent — not an error). */
  getById(id: string): Promise<Result<Review | null, ReviewError>>;

  /** Create or overwrite a review (upsert by deterministic id). */
  save(review: Review): Promise<Result<Review, ReviewError>>;

  /** Increment a review's helpful count. */
  markHelpful(id: string): Promise<Result<Review, ReviewError>>;

  /** Delete a review (moderation). */
  remove(id: string): Promise<Result<void, ReviewError>>;
}
