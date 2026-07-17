import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { PermissionSetName } from './permission-set-name';

describe('PermissionSetName', () => {
  it('trims valid input', () => {
    const result = PermissionSetName.create('  Hello world  ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('Hello world');
    }
  });

  it.each(['', '   '])('rejects blank input %j', (raw) => {
    expect(isErr(PermissionSetName.create(raw))).toBe(true);
  });

  it('rejects input longer than the max length', () => {
    expect(
      isErr(PermissionSetName.create('a'.repeat(PermissionSetName.maxLength + 1))),
    ).toBe(true);
  });
});
