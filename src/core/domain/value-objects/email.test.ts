import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { Email } from './email';

describe('Email', () => {
  it('normalizes valid input (trim + lowercase)', () => {
    const result = Email.create('  User@Example.COM ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('user@example.com');
    }
  });

  it.each(['', 'not-an-email', 'foo@bar', 'a@b@c.com', 'spaces in@x.com'])(
    'rejects invalid input %j',
    (raw) => {
      expect(isErr(Email.create(raw))).toBe(true);
    },
  );

  it('compares by value', () => {
    const a = Email.create('a@x.com');
    const b = Email.create('A@X.com');
    if (isOk(a) && isOk(b)) {
      expect(a.value.equals(b.value)).toBe(true);
    }
  });
});
