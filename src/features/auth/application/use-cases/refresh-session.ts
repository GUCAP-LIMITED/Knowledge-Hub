import { type Result, err, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  type SessionStore,
  InvalidCredentialsError,
} from '../../domain';

export interface RefreshSessionUseCaseDeps {
  readonly authGateway: AuthGateway;
  readonly sessionStore: SessionStore;
  readonly logger: Logger;
}

/**
 * Exchange the current session's refresh token for a fresh one and persist it. Used by the HTTP
 * auth-refresh decorator to recover from a `401`. Any failure (missing token or a rejected
 * exchange) clears the stored session so the app falls back to sign-in.
 */
export class RefreshSessionUseCase {
  private readonly authGateway: AuthGateway;
  private readonly sessionStore: SessionStore;
  private readonly logger: Logger;

  public constructor(deps: RefreshSessionUseCaseDeps) {
    this.authGateway = deps.authGateway;
    this.sessionStore = deps.sessionStore;
    this.logger = deps.logger.child('refresh-session');
  }

  public async execute(session: AuthSession): Promise<Result<AuthSession, AuthError>> {
    const token = session.refreshToken;
    if (token === null || token.length === 0) {
      this.logger.info('No refresh token available; signing out');
      this.sessionStore.clear();
      return err(new InvalidCredentialsError());
    }

    const refreshed = await this.authGateway.refresh(token);
    if (isErr(refreshed)) {
      this.logger.info('Could not refresh session; signing out', {
        code: refreshed.error.code,
      });
      this.sessionStore.clear();
      return refreshed;
    }

    this.sessionStore.save(refreshed.value);
    return refreshed;
  }
}
