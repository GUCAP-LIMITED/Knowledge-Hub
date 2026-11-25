import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok, err } from '@core/result';
import { FakeReviewGateway, silentLogger } from '@testing';
import { RecentReview, ReviewsUnavailableError } from '../../domain';
import { GetRecentReviewsUseCase } from './get-recent-reviews';

const makeUseCase = (gateway: FakeReviewGateway): GetRecentReviewsUseCase =>
  new GetRecentReviewsUseCase({
    reviewGateway: gateway,
    logger: silentLogger(),
  });

describe('GetRecentReviewsUseCase', () => {
  it('returns recent reviews on success and records query params', async () => {
    const gateway = new FakeReviewGateway();
    const item = new RecentReview({
      id: 'r1',
      contentItemId: 'c1',
      courseTitle: 'TypeScript Masterclass',
      courseSlug: 'typescript-masterclass',
      courseThumbnailUrl: null,
      userId: 'u1',
      reviewerName: 'John Doe',
      reviewerEmail: 'john@example.com',
      rating: 5,
      feedback: 'Great course!',
      helpfulCount: 3,
      creationTime: new Date('2026-09-07T12:00:00Z'),
    });
    gateway.getRecentReviewsResult = ok({
      totalCount: 1,
      items: [item],
    });

    const query = { filter: 'TypeScript', stars: 5 };
    const result = await makeUseCase(gateway).execute(query);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalCount).toBe(1);
      expect(result.value.items[0]?.courseTitle).toBe('TypeScript Masterclass');
    }
    expect(gateway.lastRecentReviewsQuery).toEqual(query);
  });

  it('returns error when gateway fails', async () => {
    const gateway = new FakeReviewGateway();
    gateway.getRecentReviewsResult = err(new ReviewsUnavailableError('Server error'));

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
