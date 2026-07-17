import { describe, expect, it } from 'vitest';
import { isOk } from '@core/result';
import { decodeAccessToken, deriveRoles, toSessionFromClaims } from './decode-jwt';

function makeToken(payload: object): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

describe('decodeAccessToken', () => {
  it('decodes the JWT payload claims', () => {
    const claims = decodeAccessToken(
      makeToken({ sub: 's1', email: 'a@b.com', data_scope: '5' }),
    );
    expect(claims.sub).toBe('s1');
    expect(claims.data_scope).toBe('5');
  });

  it('returns {} for malformed input (never throws)', () => {
    expect(decodeAccessToken('not-a-jwt')).toEqual({});
    expect(decodeAccessToken('a.!!!.c')).toEqual({});
  });
});

describe('deriveRoles', () => {
  it('maps global/branch-all → admin, team → manager, else consultant', () => {
    expect(deriveRoles({ is_global: 'true' })).toEqual(['admin']);
    expect(deriveRoles({ data_scope: '10' })).toEqual(['admin']);
    expect(deriveRoles({ data_scope: '5' })).toEqual(['manager']);
    expect(deriveRoles({ data_scope: '0' })).toEqual(['consultant']);
    expect(deriveRoles({})).toEqual(['consultant']);
  });
});

describe('toSessionFromClaims', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('builds a session with derived role, userType and expiry', () => {
    const result = toSessionFromClaims({
      claims: {
        sub: 's1',
        name: 'Ada',
        email: 'ada@uapp.com',
        data_scope: '10',
        active_user_type: 'Admin',
      },
      accessToken: 'at',
      refreshToken: 'rt',
      expiresIn: 3600,
      now,
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.user.userType).toBe('Admin');
      expect(result.value.user.hasRole('admin')).toBe(true);
      expect(result.value.user.fullName).toBe('Ada');
      expect(result.value.refreshToken).toBe('rt');
      expect(result.value.expiresAt.getTime()).toBe(now.getTime() + 3600 * 1000);
    }
  });

  it('synthesizes a valid email when the claim is missing', () => {
    const result = toSessionFromClaims({
      claims: { sub: 'abc' },
      accessToken: 'at',
      refreshToken: null,
      expiresIn: 60,
      now,
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.user.email.value).toContain('@');
    }
  });
});
