import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Review,
  type ReviewError,
  type ReviewGateway,
  ReviewNotFoundError,
} from '../domain';
import { REVIEW_SEED } from './review-seed';

export interface InMemoryReviewGatewayDeps {
  readonly logger: Logger;
}

/** In-memory {@link ReviewGateway} seeded from the prototype. */
export class InMemoryReviewGateway implements ReviewGateway {
  private readonly logger: Logger;
  private readonly reviews: Map<string, Review>;

  public constructor(deps: InMemoryReviewGatewayDeps) {
    this.logger = deps.logger.child('review-gateway');
    this.reviews = new Map(REVIEW_SEED.map((props) => [props.id, new Review(props)]));
  }

  public list(): Promise<Result<readonly Review[], ReviewError>> {
    return Promise.resolve(ok([...this.reviews.values()]));
  }

  public listByCourse(courseId: string): Promise<Result<readonly Review[], ReviewError>> {
    const forCourse = [...this.reviews.values()].filter(
      (review) => review.courseId === courseId,
    );
    return Promise.resolve(ok(forCourse));
  }

  public getById(id: string): Promise<Result<Review | null, ReviewError>> {
    return Promise.resolve(ok(this.reviews.get(id) ?? null));
  }

  public save(review: Review): Promise<Result<Review, ReviewError>> {
    this.reviews.set(review.id, review);
    return Promise.resolve(ok(review));
  }

  public markHelpful(id: string): Promise<Result<Review, ReviewError>> {
    const review = this.reviews.get(id);
    if (review === undefined) {
      return Promise.resolve(err(new ReviewNotFoundError(id)));
    }
    const updated = review.withHelpful(review.helpful + 1);
    this.reviews.set(id, updated);
    return Promise.resolve(ok(updated));
  }

  public remove(id: string): Promise<Result<void, ReviewError>> {
    if (!this.reviews.has(id)) {
      this.logger.warn('Review not found for removal', { id });
      return Promise.resolve(err(new ReviewNotFoundError(id)));
    }
    this.reviews.delete(id);
    return Promise.resolve(ok(undefined));
  }
}
