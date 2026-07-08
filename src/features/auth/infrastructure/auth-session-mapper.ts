import { type Result, ok, err, isErr } from '@core/result';
import { Email } from '@core/domain';
import {
  type AuthError,
  AuthServiceUnavailableError,
  AuthenticatedUser,
  AuthSession,
} from '../domain';
import type { LoginResponse } from './dto/auth-api.dto';

/**
 * Translates the transport-level login response into the domain `AuthSession`. All knowledge of
 * "how the API encodes a user" lives here, so the domain and application layers stay free of JSON
 * concerns.
 */
export function toAuthSession(
  dto: LoginResponse,
  now: Date,
): Result<AuthSession, AuthError> {
  const email = Email.create(dto.user.email);
  if (isErr(email)) {
    return err(new AuthServiceUnavailableError(email.error));
  }

  const user = new AuthenticatedUser({
    id: dto.user.id,
    email: email.value,
    fullName: dto.user.fullName ?? email.value.value,
    roles: dto.user.roles,
    userType: dto.user.userType ?? null,
  });

  const session = new AuthSession({
    user,
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken ?? null,
    // `tokenType` carries a Zod default of 'Bearer', so it is always present after parsing.
    tokenType: dto.tokenType,
    expiresAt: new Date(now.getTime() + dto.expiresIn * 1000),
  });

  return ok(session);
}
