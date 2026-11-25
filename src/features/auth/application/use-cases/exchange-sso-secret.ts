import { type Result, err, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  type SessionStore,
  InvalidCredentialsError,
} from '../../domain';

export interface ExchangeSsoSecretUseCaseDeps {
  readonly authGateway: AuthGateway;
  readonly sessionStore: SessionStore;
  readonly logger: Logger;
}

/**
 * Exchange a Portal SSO secret (the `?token=` value) for an authenticated session.
 *
 * Pure orchestration: validate input → call the domain port → persist on success.
 */
export class ExchangeSsoSecretUseCase {
  private readonly authGateway: AuthGateway;
  private readonly sessionStore: SessionStore;
  private readonly logger: Logger;

  public constructor(deps: ExchangeSsoSecretUseCaseDeps) {
    this.authGateway = deps.authGateway;
    this.sessionStore = deps.sessionStore;
    this.logger = deps.logger.child('exchange-sso-secret');
  }

  public async execute(rawSecret: string): Promise<Result<AuthSession, AuthError>> {
    const secret = rawSecret.trim();
    if (secret === '') {
      return err(new InvalidCredentialsError());
    }

    const result = await this.authGateway.exchangeSsoSecret(secret);
    if (isErr(result)) {
      this.logger.warn('SSO exchange failed', { code: result.error.code });
      return result;
    }

    this.sessionStore.save(result.value);
    this.logger.info('User authenticated via SSO', { userId: result.value.user.id });
    return result;
  }
}
