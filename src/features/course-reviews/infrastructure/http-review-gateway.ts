import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import type { HttpClient } from '@core/http';
import {
  Review,
  CourseReviewStatistics,
  TopRatedCourse,
  RecentReview,
  type ReviewError,
  type ReviewGateway,
  type CourseStatisticsQuery,
  type RecentReviewsQuery,
  type GetReviewsQuery,
  type SelectableContentItem,
  type SelectableContentParams,
  type PagedResult,
  ReviewNotFoundError,
  ReviewsUnavailableError,
} from '../domain';
import {
  courseReviewStatisticsDtoSchema,
  pagedRecentReviewsDtoSchema,
  pagedReviewsDtoSchema,
  pagedSelectableContentDtoSchema,
  reviewDtoSchema,
  type CourseReviewStatisticsDto,
  type RecentReviewDto,
  type ReviewDto,
} from './dto/review-api.dto';
import {
  buildStatisticsQueryString,
  buildRecentReviewsQueryString,
  buildReviewsQueryString,
  buildSelectableContentQueryString,
} from './review-query-builders';

export interface HttpReviewGatewayDeps {
  readonly logger: Logger;
  readonly http: HttpClient;
}

interface PagedResultDto<T> {
  totalCount: number;
  items: T[];
}

export class HttpReviewGateway implements ReviewGateway {
  private readonly logger: Logger;
  private readonly http: HttpClient;

  public constructor(deps: HttpReviewGatewayDeps) {
    this.logger = deps.logger.child('review-gateway');
    this.http = deps.http;
  }

  public async list(): Promise<Result<readonly Review[], ReviewError>> {
    try {
      const response = await this.http.get<PagedResultDto<ReviewDto>>(`/api/app/review`);
      return ok(response.items.map((dto) => this.mapToEntity(dto)));
    } catch (e: unknown) {
      this.logger.error('Failed to list all reviews', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async listByContent(
    contentId: string,
  ): Promise<Result<readonly Review[], ReviewError>> {
    try {
      const response = await this.http.get<PagedResultDto<ReviewDto>>(
        `/api/app/review/for-content/${contentId}`,
        {
          query: {
            maxResultCount: 1000,
          },
        },
      );
      return ok(response.items.map((dto) => this.mapToEntity(dto)));
    } catch (e: unknown) {
      this.logger.error('Failed to list reviews', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async getById(_id: string): Promise<Result<Review | null, ReviewError>> {
    this.logger.warn('getById() not supported on HttpReviewGateway yet');
    return Promise.resolve(ok(null));
  }

  public async save(review: Review): Promise<Result<Review, ReviewError>> {
    try {
      const response = await this.http.post<ReviewDto>(
        `/api/app/review/submit/${review.contentId}`,
        {
          rating: review.rating,
          feedback: review.feedback,
        },
      );
      return ok(this.mapToEntity(response));
    } catch (e: unknown) {
      this.logger.error('Failed to save review', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async markHelpful(id: string): Promise<Result<Review, ReviewError>> {
    try {
      const response = await this.http.post<unknown>(
        `/api/app/review/${id}/mark-helpful`,
        {},
      );
      const dto = reviewDtoSchema.parse(response);
      return ok(this.mapToEntity(dto));
    } catch (e: unknown) {
      this.logger.error('Failed to mark review helpful', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async unmarkHelpful(id: string): Promise<Result<Review, ReviewError>> {
    try {
      const response = await this.http.post<unknown>(
        `/api/app/review/${id}/unmark-helpful`,
        {},
      );
      const dto = reviewDtoSchema.parse(response);
      return ok(this.mapToEntity(dto));
    } catch (e: unknown) {
      this.logger.error('Failed to unmark review helpful', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async remove(id: string): Promise<Result<void, ReviewError>> {
    try {
      await this.http.delete(`/api/app/review/${id}`);
      return ok(undefined);
    } catch (e: unknown) {
      this.logger.error('Failed to remove review', e);
      return err(new ReviewNotFoundError(id));
    }
  }

  public async getCourseStatistics(
    query?: CourseStatisticsQuery,
  ): Promise<Result<CourseReviewStatistics, ReviewError>> {
    try {
      const url = `/api/app/review/course-statistics${buildStatisticsQueryString(query)}`;
      const raw = await this.http.get<unknown>(url);
      const dto = courseReviewStatisticsDtoSchema.parse(raw);
      return ok(this.mapToStatistics(dto));
    } catch (e: unknown) {
      this.logger.error('Failed to get course review statistics', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async getRecentReviews(
    query?: RecentReviewsQuery,
  ): Promise<Result<PagedResult<RecentReview>, ReviewError>> {
    try {
      const url = `/api/app/review/recent${buildRecentReviewsQueryString(query)}`;
      const raw = await this.http.get<unknown>(url);
      const parsed = pagedRecentReviewsDtoSchema.parse(raw);
      return ok({
        totalCount: parsed.totalCount,
        items: parsed.items.map((dto) => this.mapToRecentReview(dto)),
      });
    } catch (e: unknown) {
      this.logger.error('Failed to get recent reviews', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async getReviews(
    query?: GetReviewsQuery,
  ): Promise<Result<PagedResult<Review>, ReviewError>> {
    try {
      const url = `/api/app/review${buildReviewsQueryString(query)}`;
      const raw = await this.http.get<unknown>(url);
      const parsed = pagedReviewsDtoSchema.parse(raw);
      return ok({
        totalCount: parsed.totalCount,
        items: parsed.items.map((dto) => this.mapToEntity(dto)),
      });
    } catch (e: unknown) {
      this.logger.error('Failed to get reviews', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  public async getSelectableContentItems(
    query?: SelectableContentParams,
  ): Promise<Result<PagedResult<SelectableContentItem>, ReviewError>> {
    try {
      const url = `/api/app/review/selectable-content-items${buildSelectableContentQueryString(query)}`;
      const raw = await this.http.get<unknown>(url);
      const parsed = pagedSelectableContentDtoSchema.parse(raw);
      return ok({
        totalCount: parsed.totalCount,
        items: parsed.items.map((dto) => ({
          id: dto.id,
          title: dto.title,
          slug: dto.slug ?? undefined,
          type: dto.type,
          typeName: dto.typeName,
        })),
      });
    } catch (e: unknown) {
      this.logger.error('Failed to get selectable content items', e);
      return err(new ReviewsUnavailableError(e));
    }
  }

  private mapToStatistics(dto: CourseReviewStatisticsDto): CourseReviewStatistics {
    return new CourseReviewStatistics({
      totalReviews: dto.totalReviews,
      averageRating: dto.averageRating,
      totalRatedCourses: dto.totalRatedCourses,
      totalHelpfulVotes: dto.totalHelpfulVotes || dto.helpfulVotes || 0,
      ratingBreakdown: {
        fiveStars: dto.ratingBreakdown.fiveStars,
        fourStars: dto.ratingBreakdown.fourStars,
        threeStars: dto.ratingBreakdown.threeStars,
        twoStars: dto.ratingBreakdown.twoStars,
        oneStar: dto.ratingBreakdown.oneStar,
      },
      topRatedCourses: dto.topRatedCourses.map(
        (course) =>
          new TopRatedCourse({
            courseId: course.courseId,
            title: course.title,
            slug: course.slug,
            averageRating: course.averageRating,
            totalReviews: course.totalReviews,
            totalHelpfulVotes: course.totalHelpfulVotes || course.helpfulVotes || 0,
            thumbnailUrl: course.thumbnailUrl,
          }),
      ),
    });
  }

  private mapToRecentReview(dto: RecentReviewDto): RecentReview {
    return new RecentReview({
      id: dto.id,
      contentItemId: dto.contentItemId,
      courseTitle: dto.courseTitle,
      courseSlug: dto.courseSlug,
      courseThumbnailUrl: dto.courseThumbnailUrl,
      userId: dto.userId,
      reviewerName: dto.reviewerName,
      reviewerEmail: dto.reviewerEmail,
      rating: dto.rating,
      feedback: dto.feedback ?? '',
      helpfulCount: dto.helpfulCount,
      creationTime: new Date(dto.creationTime),
      isHelpful: dto.isHelpful,
    });
  }

  private mapToEntity(dto: ReviewDto): Review {
    return new Review({
      id: dto.id,
      contentId: dto.contentItemId,
      contentName: dto.contentTitle ?? 'Unknown',
      userId: dto.userId,
      userName: dto.userName ?? 'Anonymous',
      userRole: 'Learner',
      rating: dto.rating,
      feedback: dto.feedback ?? '',
      createdAt: new Date(dto.creationTime),
      helpful: dto.helpfulCount,
      isHelpful: dto.isHelpful,
    });
  }
}
