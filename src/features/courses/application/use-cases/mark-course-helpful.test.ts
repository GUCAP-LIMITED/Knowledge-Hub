import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeCourseGateway, silentLogger, buildCourse } from '@testing';
import { CourseNotFoundError } from '../../domain';
import { MarkCourseHelpfulUseCase } from './mark-course-helpful';

const makeUseCase = (gateway: FakeCourseGateway): MarkCourseHelpfulUseCase =>
  new MarkCourseHelpfulUseCase({ courseGateway: gateway, logger: silentLogger() });

describe('MarkCourseHelpfulUseCase', () => {
  it('marks the course helpful via the gateway', async () => {
    const gateway = new FakeCourseGateway();
    gateway.markHelpfulResult = ok(
      buildCourse({ id: 'course-1', helpfulCount: 5, isHelpful: true }),
    );

    const result = await makeUseCase(gateway).execute('course-1');

    expect(gateway.lastMarkedHelpfulId).toBe('course-1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.helpfulCount).toBe(5);
      expect(result.value.isHelpful).toBe(true);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeCourseGateway();
    gateway.markHelpfulResult = err(new CourseNotFoundError('missing'));

    const result = await makeUseCase(gateway).execute('missing');

    expect(isErr(result)).toBe(true);
  });
});
