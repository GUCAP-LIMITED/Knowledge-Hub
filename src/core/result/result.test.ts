import { describe, expect, it } from 'vitest';
import { UnexpectedError } from '@core/errors';
import { err, isErr, isOk, mapResult, ok } from './result';

describe('Result', () => {
  it('creates a success that narrows with isOk', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  it('creates a failure that narrows with isErr', () => {
    const error = new UnexpectedError('boom');
    const result = err(error);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBe(error);
    }
  });

  it('maps the success value but leaves failures untouched', () => {
    expect(mapResult(ok(2), (n) => n * 10)).toStrictEqual(ok(20));

    const failure = err(new UnexpectedError('nope'));
    expect(mapResult(failure, (n: number) => n * 10)).toBe(failure);
  });
});
