import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok, err } from '@core/result';
import { FakeReviewGateway, silentLogger } from '@testing';
import { Review, ReviewsUnavailableError } from '../../domain';
import { UnmarkReviewHelpfulUseCase } from './unmark-review-helpful';

const makeUseCase = (gateway: FakeReviewGateway): UnmarkReviewHelpfulUseCase =>
  new UnmarkReviewHelpfulUseCase({
    reviewGateway: gateway,
    logger: silentLogger(),
  });

describe('UnmarkReviewHelpfulUseCase', () => {
  it('unmarks helpful on gateway successfully', async () => {
    const gateway = new FakeReviewGateway();
    const updatedReview = new Review({
      id: 'rev-1',
      contentId: 'course-1',
      contentName: 'Clean Architecture',
      userId: 'user-1',
      userName: 'John Doe',
      userRole: 'Learner',
      rating: 5,
      feedback: 'Great course!',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      helpful: 0,
      isHelpful: false,
    });
    gateway.unmarkHelpfulResult = ok(updatedReview);

    const result = await makeUseCase(gateway).execute('rev-1');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.helpful).toBe(0);
      expect(result.value.isHelpful).toBe(false);
    }
  });

  it('returns error when gateway fails', async () => {
    const gateway = new FakeReviewGateway();
    gateway.unmarkHelpfulResult = err(new ReviewsUnavailableError('Network error'));

    const result = await makeUseCase(gateway).execute('rev-1');

    expect(isErr(result)).toBe(true);
  });
});
