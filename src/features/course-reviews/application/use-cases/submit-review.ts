import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import {
  Rating,
  Review,
  type ReviewError,
  ReviewFeedback,
  type ReviewGateway,
} from '../../domain';

export interface SubmitReviewInput {
  readonly courseId: string;
  readonly courseName: string;
  readonly userId: string;
  readonly userName: string;
  readonly userRole: string;
  readonly rating: number;
  readonly feedback: string;
}

export interface SubmitReviewUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
  readonly clock: Clock;
}

/**
 * Create or update the caller's review of a course. Validates the rating and comment via value
 * objects, then upserts by the deterministic id (one review per user per course). Editing preserves
 * the original timestamp and helpful count.
 */
export class SubmitReviewUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;
  private readonly clock: Clock;

  public constructor(deps: SubmitReviewUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('submit-review');
    this.clock = deps.clock;
  }

  public async execute(input: SubmitReviewInput): Promise<Result<Review, ReviewError>> {
    const rating = Rating.create(input.rating);
    if (isErr(rating)) {
      this.logger.warn('Rejected invalid rating', { code: rating.error.code });
      return rating;
    }
    const feedback = ReviewFeedback.create(input.feedback);
    if (isErr(feedback)) {
      this.logger.warn('Rejected invalid feedback', { code: feedback.error.code });
      return feedback;
    }

    const id = Review.idFor(input.courseId, input.userId);
    const existing = await this.reviewGateway.getById(id);
    if (isErr(existing)) {
      return existing;
    }
    const prior = existing.value;

    const review = new Review({
      id,
      courseId: input.courseId,
      courseName: input.courseName,
      userId: input.userId,
      userName: input.userName,
      userRole: input.userRole,
      rating: rating.value.value,
      feedback: feedback.value.value,
      createdAt: prior?.createdAt ?? this.clock.now(),
      helpful: prior?.helpful ?? 0,
    });

    const saved = await this.reviewGateway.save(review);
    if (isErr(saved)) {
      this.logger.warn('Saving review failed', { code: saved.error.code });
      return saved;
    }
    this.logger.info('Review submitted', { id });
    return saved;
  }
}
