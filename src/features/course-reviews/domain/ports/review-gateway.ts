import type { Result } from '@core/result';
import type { ReviewError } from '../errors/review-errors';
import type { Review } from '../entities/review';
import type { CourseReviewStatistics } from '../entities/course-review-statistics';
import type { RecentReview } from '../entities/recent-review';

import type {
  SelectableContentItem,
  SelectableContentParams,
} from '../entities/selectable-content-item';

export interface CourseStatisticsQuery {
  readonly topCount?: number | undefined;
  readonly publishedOnly?: boolean | undefined;
  readonly branchId?: string | undefined;
}

export interface RecentReviewsQuery {
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
  readonly sorting?: string | undefined;
  readonly reviewer?: string | undefined;
  readonly course?: string | undefined;
  readonly courseId?: string | undefined;
  readonly feedback?: string | undefined;
  readonly stars?: number | undefined;
  readonly filter?: string | undefined;
  readonly branchId?: string | undefined;
}

export interface GetReviewsQuery {
  readonly contentType?: number | undefined;
  readonly contentItemId?: string | undefined;
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
  readonly sorting?: string | undefined;
}

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
}

/** Port to the reviews store. States the contract in domain terms; storage lives in infrastructure. */
export interface ReviewGateway {
  /** Every review (moderation view). */
  list(): Promise<Result<readonly Review[], ReviewError>>;

  /** Reviews for a single content item. */
  listByContent(contentId: string): Promise<Result<readonly Review[], ReviewError>>;

  /** Fetch a single review by id (returns null when absent — not an error). */
  getById(id: string): Promise<Result<Review | null, ReviewError>>;

  /** Create or overwrite a review (upsert by deterministic id). */
  save(review: Review): Promise<Result<Review, ReviewError>>;

  /** Increment a review's helpful count. */
  markHelpful(id: string): Promise<Result<Review, ReviewError>>;

  /** Remove a helpful vote from a review. */
  unmarkHelpful(id: string): Promise<Result<Review, ReviewError>>;

  /** Delete a review (moderation). */
  remove(id: string): Promise<Result<void, ReviewError>>;

  /** Aggregated course statistics including rating breakdown and top-rated courses. */
  getCourseStatistics(
    query?: CourseStatisticsQuery,
  ): Promise<Result<CourseReviewStatistics, ReviewError>>;

  /** Paginated recent reviews with advanced filtering. */
  getRecentReviews(
    query?: RecentReviewsQuery,
  ): Promise<Result<PagedResult<RecentReview>, ReviewError>>;

  /** Paginated reviews optionally filtered by content type and/or specific content item. */
  getReviews(query?: GetReviewsQuery): Promise<Result<PagedResult<Review>, ReviewError>>;

  /** Paginated, searchable selectable content items with database-level Full-Text Fuzzy search. */
  getSelectableContentItems(
    query?: SelectableContentParams,
  ): Promise<Result<PagedResult<SelectableContentItem>, ReviewError>>;
}
