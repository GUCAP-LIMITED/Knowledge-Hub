import type { Result } from '@core/result';
import type { AuthError } from '../errors/auth-errors';
import type { AuthSession } from '../entities/auth-session';
import type { Password } from '../value-objects/password';
import type { Email } from '@core/domain';

/**
 * Port to the authentication service. The domain defines the contract in *its own* terms
 * (`Email` + `Password` in, `AuthSession` out); the HTTP details live in the infrastructure
 * implementation. This is the Dependency Inversion seam.
 */
export interface AuthGateway {
  /** Exchange an email + password for an authenticated session. */
  authenticate(email: Email, password: Password): Promise<Result<AuthSession, AuthError>>;

  /** Exchange a refresh token for a fresh session. */
  refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>>;

  /** Best-effort token revocation. Never throws; failures are the caller's gain to ignore. */
  signOut(session: AuthSession): Promise<void>;
}
