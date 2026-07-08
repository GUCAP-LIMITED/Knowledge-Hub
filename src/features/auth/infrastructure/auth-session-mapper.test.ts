import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { AuthServiceUnavailableError } from '../domain';
import { toAuthSession } from './auth-session-mapper';
import type { LoginResponse } from './dto/auth-api.dto';

const loginResponse = (overrides: Partial<LoginResponse> = {}): LoginResponse => ({
  accessToken: 'access-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  refreshToken: 'refresh-token',
  user: {
    id: 'user-123',
    email: 'Jane@Example.com',
    fullName: 'Jane Doe',
    roles: ['Member', 'Admin'],
    userType: 'staff',
  },
  ...overrides,
});

describe('AuthSessionMapper', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('maps a well-formed login response into a domain session', () => {
    const result = toAuthSession(loginResponse(), now);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      const { user, expiresAt, refreshToken } = result.value;
      expect(user.id).toBe('user-123');
      expect(user.email.value).toBe('jane@example.com');
      expect(user.fullName).toBe('Jane Doe');
      expect(user.hasRole('admin')).toBe(true);
      expect(user.userType).toBe('staff');
      expect(refreshToken).toBe('refresh-token');
      expect(expiresAt.toISOString()).toBe('2026-01-01T01:00:00.000Z');
    }
  });

  it('falls back to the email when no full name is provided', () => {
    const result = toAuthSession(
      loginResponse({
        user: { id: 'u1', email: 'a@b.com', roles: [], userType: null },
      }),
      now,
    );
    expect(isOk(result) && result.value.user.fullName).toBe('a@b.com');
  });

  it('fails with a service-unavailable error when the email is invalid', () => {
    const result = toAuthSession(
      loginResponse({
        user: { id: 'u1', email: 'not-an-email', roles: [], userType: null },
      }),
      now,
    );
    expect(isErr(result) && result.error).toBeInstanceOf(AuthServiceUnavailableError);
  });
});
