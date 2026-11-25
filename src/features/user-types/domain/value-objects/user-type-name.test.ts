import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { UserTypeName } from './user-type-name';

describe('UserTypeName', () => {
  it('trims valid input', () => {
    const result = UserTypeName.create('  Hello world  ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('Hello world');
    }
  });

  it.each(['', '   '])('rejects blank input %j', (raw) => {
    expect(isErr(UserTypeName.create(raw))).toBe(true);
  });

  it('rejects input longer than the max length', () => {
    expect(isErr(UserTypeName.create('a'.repeat(UserTypeName.maxLength + 1)))).toBe(true);
  });
});
