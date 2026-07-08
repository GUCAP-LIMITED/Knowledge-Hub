import { type Result, ok, isErr } from '@core/result';
import type { Clock } from '@core/time';
import type { Logger } from '@core/logger';
import type { AuthError, AuthGateway, AuthSession, SessionStore } from '../../domain';

export interface RestoreSessionUseCaseDeps {
  readonly authGateway: AuthGateway;
  readonly sessionStore: SessionStore;
  readonly clock: Clock;
  readonly logger: Logger;
}

/**
 * Re-establish a session on app start: load the persisted one, and silently refresh it if the
 * access token has expired but a refresh token is available. Any unrecoverable state resolves to
 * "no session" (the app then shows sign-in) rather than surfacing an error to the user.
 */
export class RestoreSessionUseCase {
  private readonly authGateway: AuthGateway;
  private readonly sessionStore: SessionStore;
  private readonly clock: Clock;
  private readonly logger: Logger;

  public constructor(deps: RestoreSessionUseCaseDeps) {
    this.authGateway = deps.authGateway;
    this.sessionStore = deps.sessionStore;
    this.clock = deps.clock;
    this.logger = deps.logger.child('restore-session');
  }

  public async execute(): Promise<Result<AuthSession | null, AuthError>> {
    const session = this.sessionStore.load();
    if (session === null) {
      return ok(null);
    }

    if (session.isValid(this.clock.now())) {
      return ok(session);
    }

    const refreshToken = session.refreshToken;
    if (refreshToken === null || refreshToken.length === 0) {
      this.sessionStore.clear();
      return ok(null);
    }

    const refreshed = await this.authGateway.refresh(refreshToken);
    if (isErr(refreshed)) {
      this.logger.info('Could not refresh session; signing out', {
        code: refreshed.error.code,
      });
      this.sessionStore.clear();
      return ok(null);
    }

    this.sessionStore.save(refreshed.value);
    return ok(refreshed.value);
  }
}
