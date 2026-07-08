import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { CourseTitle } from './course-title';

describe('CourseTitle', () => {
  it('accepts a valid, trimmed title', () => {
    const result = CourseTitle.create('  Advanced Sales  ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('Advanced Sales');
    }
  });

  it('rejects a title shorter than the minimum', () => {
    expect(isErr(CourseTitle.create('ab'))).toBe(true);
  });

  it('rejects a title longer than the maximum', () => {
    expect(isErr(CourseTitle.create('x'.repeat(CourseTitle.maxLength + 1)))).toBe(true);
  });
});
