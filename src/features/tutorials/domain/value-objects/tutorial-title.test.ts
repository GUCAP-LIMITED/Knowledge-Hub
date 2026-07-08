import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { TutorialTitle } from './tutorial-title';

describe('TutorialTitle', () => {
  it('accepts a valid, trimmed title', () => {
    const result = TutorialTitle.create('  Adding a Student  ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('Adding a Student');
    }
  });

  it('rejects a title shorter than the minimum', () => {
    expect(isErr(TutorialTitle.create('ab'))).toBe(true);
  });

  it('rejects a title longer than the maximum', () => {
    expect(isErr(TutorialTitle.create('x'.repeat(TutorialTitle.maxLength + 1)))).toBe(
      true,
    );
  });
});
