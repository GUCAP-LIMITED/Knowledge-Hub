import { DomainError } from '@core/errors';

/** Base type for every course-reviews-domain failure. */
export abstract class ReviewError extends DomainError {}

/** The reviews source could not be reached or returned an unexpected response. */
export class ReviewsUnavailableError extends ReviewError {
  public readonly code = 'REVIEWS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('Course reviews are currently unavailable. Please try again.', { cause });
  }
}

/** No review exists for the given id. */
export class ReviewNotFoundError extends ReviewError {
  public readonly code = 'REVIEWS_NOT_FOUND';

  public constructor(id: string) {
    super(`No review found for id "${id}".`, { context: { id } });
  }
}

/** A rating outside the allowed 1–5 range. */
export class InvalidRatingError extends ReviewError {
  public readonly code = 'REVIEWS_INVALID_RATING';

  public constructor(value: number) {
    super(`Rating must be a whole number from 1 to 5 (received ${String(value)}).`, {
      context: { value },
    });
  }
}

/** Review feedback failed validation (empty or too long). */
export class InvalidReviewFeedbackError extends ReviewError {
  public readonly code = 'REVIEWS_INVALID_FEEDBACK';

  public constructor(reason: string) {
    super(`Invalid review: ${reason}`, { context: { reason } });
  }
}
