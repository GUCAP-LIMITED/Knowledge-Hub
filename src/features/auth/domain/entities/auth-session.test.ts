import { describe, expect, it } from 'vitest';
import { isOk } from '@core/result';
import { buildAuthSession } from '@testing/builders/auth-session.builder';
import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('is valid before expiry and invalid after (incl. skew)', () => {
    const session = buildAuthSession({
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    });
    expect(session.isValid(now)).toBe(true);

    const expired = buildAuthSession({ expiresAt: new Date(now.getTime() - 1000) });
    expect(expired.isExpired(now)).toBe(true);
    expect(expired.isValid(now)).toBe(false);
  });

  it('treats a token within the skew window as expired', () => {
    const session = buildAuthSession({
      expiresAt: new Date(now.getTime() + 10 * 1000),
    });
    expect(session.isExpired(now)).toBe(true);
  });

  it('reports refreshability and builds an auth header', () => {
    expect(buildAuthSession({ refreshToken: 'r' }).canRefresh).toBe(true);
    expect(buildAuthSession({ refreshToken: null }).canRefresh).toBe(false);
    expect(
      buildAuthSession({ accessToken: 'abc', tokenType: 'Bearer' }).authorizationHeader(),
    ).toBe('Bearer abc');
  });

  it('round-trips through snapshot/restore', () => {
    const original = buildAuthSession({ email: 'jane@example.com', roles: ['admin'] });
    const restored = AuthSession.restore(original.snapshot());

    expect(isOk(restored)).toBe(true);
    if (isOk(restored)) {
      expect(restored.value.user.email.value).toBe('jane@example.com');
      expect(restored.value.user.hasRole('admin')).toBe(true);
      expect(restored.value.accessToken).toBe(original.accessToken);
    }
  });
});
