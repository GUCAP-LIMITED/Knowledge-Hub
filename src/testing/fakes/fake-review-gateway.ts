import { type Result, ok } from '@core/result';
import type { Review, ReviewError, ReviewGateway } from '@features/course-reviews/domain';
import { buildReview } from '../builders/review.builder';

/** Hand-written, fully-typed fake of the {@link ReviewGateway} port. */
export class FakeReviewGateway implements ReviewGateway {
  public listResult: Result<readonly Review[], ReviewError> = ok([]);
  public listByCourseResult: Result<readonly Review[], ReviewError> = ok([]);
  public getByIdResult: Result<Review | null, ReviewError> = ok(null);
  public saveResult: Result<Review, ReviewError> = ok(buildReview());
  public markHelpfulResult: Result<Review, ReviewError> = ok(buildReview({ helpful: 1 }));
  public removeResult: Result<void, ReviewError> = ok(undefined);

  public lastSaved: Review | null = null;
  public lastRemovedId: string | null = null;
  public lastRequestedId: string | null = null;

  public list(): Promise<Result<readonly Review[], ReviewError>> {
    return Promise.resolve(this.listResult);
  }

  public listByCourse(
    _courseId: string,
  ): Promise<Result<readonly Review[], ReviewError>> {
    return Promise.resolve(this.listByCourseResult);
  }

  public getById(id: string): Promise<Result<Review | null, ReviewError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public save(review: Review): Promise<Result<Review, ReviewError>> {
    this.lastSaved = review;
    return Promise.resolve(this.saveResult);
  }

  public markHelpful(_id: string): Promise<Result<Review, ReviewError>> {
    return Promise.resolve(this.markHelpfulResult);
  }

  public remove(id: string): Promise<Result<void, ReviewError>> {
    this.lastRemovedId = id;
    return Promise.resolve(this.removeResult);
  }
}
