import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok, err } from '@core/result';
import { FakeReviewGateway, silentLogger } from '@testing';
import {
  CourseReviewStatistics,
  ReviewsUnavailableError,
  TopRatedCourse,
} from '../../domain';
import { GetCourseStatisticsUseCase } from './get-course-statistics';

const makeUseCase = (gateway: FakeReviewGateway): GetCourseStatisticsUseCase =>
  new GetCourseStatisticsUseCase({
    reviewGateway: gateway,
    logger: silentLogger(),
  });

describe('GetCourseStatisticsUseCase', () => {
  it('returns statistics on success and records query params', async () => {
    const gateway = new FakeReviewGateway();
    const stats = new CourseReviewStatistics({
      totalReviews: 42,
      averageRating: 4.7,
      totalRatedCourses: 6,
      totalHelpfulVotes: 128,
      ratingBreakdown: {
        fiveStars: 30,
        fourStars: 8,
        threeStars: 3,
        twoStars: 1,
        oneStar: 0,
      },
      topRatedCourses: [
        new TopRatedCourse({
          courseId: 'c1',
          title: 'Course 1',
          slug: 'course-1',
          averageRating: 4.9,
          totalReviews: 18,
          totalHelpfulVotes: 64,
          thumbnailUrl: null,
        }),
      ],
    });
    gateway.getCourseStatisticsResult = ok(stats);

    const query = { topCount: 5, publishedOnly: true };
    const result = await makeUseCase(gateway).execute(query);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalReviews).toBe(42);
      expect(result.value.averageRating).toBe(4.7);
      expect(result.value.topRatedCourses).toHaveLength(1);
    }
    expect(gateway.lastStatisticsQuery).toEqual(query);
  });

  it('returns error when gateway fails', async () => {
    const gateway = new FakeReviewGateway();
    gateway.getCourseStatisticsResult = err(
      new ReviewsUnavailableError('Network failure'),
    );

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
