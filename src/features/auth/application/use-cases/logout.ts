import type { Logger } from '@core/logger';
import type { AuthGateway, AuthSession, SessionStore } from '../../domain';

export interface LogoutUseCaseDeps {
  readonly authGateway: AuthGateway;
  readonly sessionStore: SessionStore;
  readonly logger: Logger;
}

/** Sign the current user out: revoke server-side (best effort) and always clear local state. */
export class LogoutUseCase {
  private readonly authGateway: AuthGateway;
  private readonly sessionStore: SessionStore;
  private readonly logger: Logger;

  public constructor(deps: LogoutUseCaseDeps) {
    this.authGateway = deps.authGateway;
    this.sessionStore = deps.sessionStore;
    this.logger = deps.logger.child('logout');
  }

  public async execute(session: AuthSession | null): Promise<void> {
    if (session !== null) {
      await this.authGateway.signOut(session);
    }
    this.sessionStore.clear();
    this.logger.info('Session cleared');
  }
}
