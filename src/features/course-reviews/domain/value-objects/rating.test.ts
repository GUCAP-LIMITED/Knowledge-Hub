import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { Rating } from './rating';

describe('Rating', () => {
  it('accepts whole numbers 1 through 5', () => {
    for (const value of [1, 2, 3, 4, 5]) {
      expect(isOk(Rating.create(value))).toBe(true);
    }
  });

  it('rejects out-of-range and non-integer values', () => {
    expect(isErr(Rating.create(0))).toBe(true);
    expect(isErr(Rating.create(6))).toBe(true);
    expect(isErr(Rating.create(3.5))).toBe(true);
  });
});
