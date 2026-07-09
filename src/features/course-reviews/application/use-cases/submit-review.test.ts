import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import { FixedClock } from '@core/time';
import { FakeReviewGateway, buildReview, silentLogger } from '@testing';
import { SubmitReviewUseCase } from './submit-review';

const makeUseCase = (gateway: FakeReviewGateway): SubmitReviewUseCase =>
  new SubmitReviewUseCase({
    reviewGateway: gateway,
    logger: silentLogger(),
    clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')),
  });

const INPUT = {
  courseId: 'course-1',
  courseName: 'Getting Started with UAPP Portal',
  userId: 'u1',
  userName: 'Simona',
  userRole: 'Consultant',
  rating: 5,
  feedback: 'Really solid course.',
};

describe('SubmitReviewUseCase', () => {
  it('creates a review with a deterministic courseId:userId id', async () => {
    const gateway = new FakeReviewGateway();
    gateway.getByIdResult = ok(null);
    gateway.saveResult = ok(buildReview({ id: 'course-1:u1' }));

    const result = await makeUseCase(gateway).execute(INPUT);

    expect(isOk(result)).toBe(true);
    expect(gateway.lastSaved?.id).toBe('course-1:u1');
  });

  it('rejects an invalid rating without saving', async () => {
    const gateway = new FakeReviewGateway();

    const result = await makeUseCase(gateway).execute({ ...INPUT, rating: 9 });

    expect(isErr(result)).toBe(true);
    expect(gateway.lastSaved).toBeNull();
  });

  it('preserves the existing helpful count when editing', async () => {
    const gateway = new FakeReviewGateway();
    gateway.getByIdResult = ok(buildReview({ id: 'course-1:u1', helpful: 7 }));
    gateway.saveResult = ok(buildReview({ id: 'course-1:u1', helpful: 7 }));

    await makeUseCase(gateway).execute(INPUT);

    expect(gateway.lastSaved?.helpful).toBe(7);
  });
});
