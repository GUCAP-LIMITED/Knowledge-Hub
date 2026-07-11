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

export interface RegisterUseCaseDeps {
  readonly authGateway: AuthGateway;
  readonly sessionStore: SessionStore;
  readonly logger: Logger;
}

/**
 * Create a new account from an email + password and sign the user straight in.
 *
 * Pure orchestration mirroring {@link LoginUseCase}: validate input → call the domain port →
 * persist the session on success. The domain owns the rules; the use case just sequences them.
 */
export class RegisterUseCase {
  private readonly authGateway: AuthGateway;
  private readonly sessionStore: SessionStore;
  private readonly logger: Logger;

  public constructor(deps: RegisterUseCaseDeps) {
    this.authGateway = deps.authGateway;
    this.sessionStore = deps.sessionStore;
    this.logger = deps.logger.child('register');
  }

  public async execute(
    rawEmail: string,
    rawPassword: string,
  ): Promise<Result<AuthSession, AuthError>> {
    const email = Email.create(rawEmail);
    if (isErr(email)) {
      return err(new InvalidCredentialsError());
    }

    const password = Password.create(rawPassword);
    if (isErr(password)) {
      return password;
    }

    const result = await this.authGateway.register(email.value, password.value);
    if (isErr(result)) {
      this.logger.warn('Registration failed', { code: result.error.code });
      return result;
    }

    this.sessionStore.save(result.value);
    this.logger.info('Account created', { userId: result.value.user.id });
    return result;
  }
}
