import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeCourseGateway, silentLogger, buildCourse } from '@testing';
import { CoursesUnavailableError } from '../../domain';
import { ListCoursesUseCase } from './list-courses';

const makeUseCase = (gateway: FakeCourseGateway): ListCoursesUseCase =>
  new ListCoursesUseCase({ courseGateway: gateway, logger: silentLogger() });

describe('ListCoursesUseCase', () => {
  it('returns the catalog from the gateway', async () => {
    const gateway = new FakeCourseGateway();
    gateway.listResult = ok([buildCourse({ id: 'course-9' })]);

    const result = await makeUseCase(gateway).execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe('course-9');
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeCourseGateway();
    gateway.listResult = err(new CoursesUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
