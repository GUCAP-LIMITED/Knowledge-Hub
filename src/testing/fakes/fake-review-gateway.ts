import { type Result, ok } from '@core/result';
import {
  CourseReviewStatistics,
  type CourseStatisticsQuery,
  type PagedResult,
  type RecentReview,
  type RecentReviewsQuery,
  type GetReviewsQuery,
  type Review,
  type ReviewError,
  type ReviewGateway,
  type SelectableContentItem,
  type SelectableContentParams,
} from '@features/course-reviews/domain';
import { buildReview } from '../builders/review.builder';

const defaultStatistics = new CourseReviewStatistics({
  totalReviews: 0,
  averageRating: 0,
  totalRatedCourses: 0,
  totalHelpfulVotes: 0,
  ratingBreakdown: {
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  },
  topRatedCourses: [],
});

/** Hand-written, fully-typed fake of the {@link ReviewGateway} port. */
export class FakeReviewGateway implements ReviewGateway {
  public listResult: Result<readonly Review[], ReviewError> = ok([]);
  public listByContentResult: Result<readonly Review[], ReviewError> = ok([]);
  public getByIdResult: Result<Review | null, ReviewError> = ok(null);
  public saveResult: Result<Review, ReviewError> = ok(buildReview());
  public markHelpfulResult: Result<Review, ReviewError> = ok(
    buildReview({ helpful: 1, isHelpful: true }),
  );
  public unmarkHelpfulResult: Result<Review, ReviewError> = ok(
    buildReview({ helpful: 0, isHelpful: false }),
  );
  public removeResult: Result<void, ReviewError> = ok(undefined);
  public getCourseStatisticsResult: Result<CourseReviewStatistics, ReviewError> =
    ok(defaultStatistics);
  public getRecentReviewsResult: Result<PagedResult<RecentReview>, ReviewError> = ok({
    totalCount: 0,
    items: [],
  });
  public getReviewsResult: Result<PagedResult<Review>, ReviewError> = ok({
    totalCount: 0,
    items: [],
  });

  public lastSaved: Review | null = null;
  public lastRemovedId: string | null = null;
  public lastRequestedId: string | null = null;
  public lastStatisticsQuery?: CourseStatisticsQuery | undefined;
  public lastRecentReviewsQuery?: RecentReviewsQuery | undefined;
  public lastReviewsQuery?: GetReviewsQuery | undefined;

  public list(): Promise<Result<readonly Review[], ReviewError>> {
    return Promise.resolve(this.listResult);
  }

  public async listByContent(
    _contentId: string,
  ): Promise<Result<readonly Review[], ReviewError>> {
    return Promise.resolve(this.listByContentResult);
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

  public unmarkHelpful(_id: string): Promise<Result<Review, ReviewError>> {
    return Promise.resolve(this.unmarkHelpfulResult);
  }

  public remove(id: string): Promise<Result<void, ReviewError>> {
    this.lastRemovedId = id;
    return Promise.resolve(this.removeResult);
  }

  public getCourseStatistics(
    query?: CourseStatisticsQuery,
  ): Promise<Result<CourseReviewStatistics, ReviewError>> {
    this.lastStatisticsQuery = query;
    return Promise.resolve(this.getCourseStatisticsResult);
  }

  public getRecentReviews(
    query?: RecentReviewsQuery,
  ): Promise<Result<PagedResult<RecentReview>, ReviewError>> {
    this.lastRecentReviewsQuery = query;
    return Promise.resolve(this.getRecentReviewsResult);
  }

  public getReviews(
    query?: GetReviewsQuery,
  ): Promise<Result<PagedResult<Review>, ReviewError>> {
    this.lastReviewsQuery = query;
    return Promise.resolve(this.getReviewsResult);
  }

  public getSelectableContentItemsResult: Result<
    PagedResult<SelectableContentItem>,
    ReviewError
  > = ok({
    totalCount: 0,
    items: [],
  });
  public lastSelectableContentQuery?: SelectableContentParams | undefined;

  public getSelectableContentItems(
    query?: SelectableContentParams,
  ): Promise<Result<PagedResult<SelectableContentItem>, ReviewError>> {
    this.lastSelectableContentQuery = query;
    return Promise.resolve(this.getSelectableContentItemsResult);
  }
}
