import type { Result } from '@core/result';
import type { AuthError } from '../errors/auth-errors';
import type { AuthSession } from '../entities/auth-session';

/**
 * Port to the SSO authentication service. The app authenticates by exchanging an opaque SSO secret
 * (issued by the Uapp Portal) for a session; there is no username/password. The domain defines the
 * contract in its own terms; the HTTP/OAuth details live in the infrastructure implementation.
 */
export interface AuthGateway {
  /** Exchange a Portal SSO secret for an authenticated session (custom `SsoSecret` grant). */
  exchangeSsoSecret(secret: string): Promise<Result<AuthSession, AuthError>>;

  /** Exchange a refresh token for a fresh session. */
  refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>>;

  /** Best-effort token revocation. Never throws; failures are the caller's gain to ignore. */
  signOut(session: AuthSession): Promise<void>;
}
