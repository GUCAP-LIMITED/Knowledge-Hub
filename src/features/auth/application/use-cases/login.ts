import { type Result, err, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import { Email } from '@core/domain';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  type SessionStore,
  InvalidCredentialsError,
  Password,
} from '../../domain';

export interface LoginUseCaseDeps {
  readonly authGateway: AuthGateway;
  readonly sessionStore: SessionStore;
  readonly logger: Logger;
}

/**
 * Sign a user in with an email + password.
 *
 * Pure orchestration: validate input → call the domain port → persist on success. There is no
 * business rule here that the domain doesn't already own; the use case just sequences the steps.
 */
export class LoginUseCase {
  private readonly authGateway: AuthGateway;
  private readonly sessionStore: SessionStore;
  private readonly logger: Logger;

  public constructor(deps: LoginUseCaseDeps) {
    this.authGateway = deps.authGateway;
    this.sessionStore = deps.sessionStore;
    this.logger = deps.logger.child('login');
  }

  public async execute(
    rawEmail: string,
    rawPassword: string,
  ): Promise<Result<AuthSession, AuthError>> {
    const email = Email.create(rawEmail);
    if (isErr(email)) {
      // Translate the shared-kernel email error into the auth vocabulary. We deliberately do NOT
      // disclose "bad email format" vs "wrong password" at the login boundary.
      return err(new InvalidCredentialsError());
    }

    const password = Password.create(rawPassword);
    if (isErr(password)) {
      return password;
    }

    const result = await this.authGateway.authenticate(email.value, password.value);
    if (isErr(result)) {
      this.logger.warn('Authentication failed', { code: result.error.code });
      return result;
    }

    this.sessionStore.save(result.value);
    this.logger.info('User authenticated', { userId: result.value.user.id });
    return result;
  }
}
