import { isErr } from '@core/result';
import { Email } from '@core/domain';
import { AuthSession, AuthenticatedUser } from '@features/auth/domain';

export interface AuthSessionOverrides {
  readonly id?: string;
  readonly email?: string;
  readonly fullName?: string;
  readonly roles?: readonly string[];
  readonly userType?: string | null;
  readonly branchIds?: readonly string[];
  readonly accessToken?: string;
  readonly refreshToken?: string | null;
  readonly tokenType?: string;
  readonly expiresAt?: Date;
}

const buildUser = (overrides: AuthSessionOverrides): AuthenticatedUser => {
  const email = Email.create(overrides.email ?? 'user@example.com');
  if (isErr(email)) {
    throw email.error;
  }
  return new AuthenticatedUser({
    id: overrides.id ?? 'user-1',
    email: email.value,
    fullName: overrides.fullName ?? 'Test User',
    roles: overrides.roles ?? ['member'],
    userType: overrides.userType ?? null,
    branchIds: overrides.branchIds ?? [],
  });
};

// `in` so an explicit `null` is honored (??/|| would collapse it back to the default).
const resolveRefreshToken = (overrides: AuthSessionOverrides): string | null =>
  'refreshToken' in overrides ? (overrides.refreshToken ?? null) : 'refresh-token';

/** Construct a valid {@link AuthSession} for tests, overriding only what matters per case. */
export const buildAuthSession = (overrides: AuthSessionOverrides = {}): AuthSession =>
  new AuthSession({
    user: buildUser(overrides),
    accessToken: overrides.accessToken ?? 'access-token',
    refreshToken: resolveRefreshToken(overrides),
    tokenType: overrides.tokenType ?? 'Bearer',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000),
  });
