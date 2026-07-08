import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { ResourceTitle } from './resource-title';

describe('ResourceTitle', () => {
  it('accepts a valid, trimmed title', () => {
    const result = ResourceTitle.create('  Overview Guide  ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('Overview Guide');
    }
  });

  it('rejects a title shorter than the minimum', () => {
    expect(isErr(ResourceTitle.create('ab'))).toBe(true);
  });

  it('rejects a title longer than the maximum', () => {
    expect(isErr(ResourceTitle.create('x'.repeat(ResourceTitle.maxLength + 1)))).toBe(
      true,
    );
  });
});
