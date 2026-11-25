import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok, err } from '@core/result';
import { FakeReviewGateway, silentLogger } from '@testing';
import { Review, ReviewsUnavailableError } from '../../domain';
import { GetReviewsUseCase } from './get-reviews';

const makeUseCase = (gateway: FakeReviewGateway): GetReviewsUseCase =>
  new GetReviewsUseCase({
    reviewGateway: gateway,
    logger: silentLogger(),
  });

describe('GetReviewsUseCase', () => {
  it('returns reviews on success and records query params', async () => {
    const gateway = new FakeReviewGateway();
    const item = new Review({
      id: 'r1',
      contentId: 'c1',
      contentName: 'TypeScript Masterclass',
      userId: 'u1',
      userName: 'John Doe',
      userRole: 'Learner',
      rating: 5,
      feedback: 'Great content!',
      createdAt: new Date('2026-09-07T12:00:00Z'),
      helpful: 2,
    });
    gateway.getReviewsResult = ok({
      totalCount: 1,
      items: [item],
    });

    const query = {
      contentType: 0,
      contentItemId: 'c1',
      skipCount: 0,
      maxResultCount: 10,
    };
    const result = await makeUseCase(gateway).execute(query);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalCount).toBe(1);
      expect(result.value.items[0]?.contentName).toBe('TypeScript Masterclass');
    }
    expect(gateway.lastReviewsQuery).toEqual(query);
  });

  it('returns error when gateway fails', async () => {
    const gateway = new FakeReviewGateway();
    gateway.getReviewsResult = err(new ReviewsUnavailableError('Server error'));

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
