import { type Result, err } from '@core/result';
import type { Email } from '@core/domain';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  type Password,
  InvalidCredentialsError,
} from '@features/auth/domain';

/** Hand-written, fully-typed fake of the {@link AuthGateway} port. */
export class FakeAuthGateway implements AuthGateway {
  public authenticateResult: Result<AuthSession, AuthError> = err(
    new InvalidCredentialsError(),
  );
  public registerResult: Result<AuthSession, AuthError> = err(
    new InvalidCredentialsError(),
  );
  public refreshResult: Result<AuthSession, AuthError> = err(
    new InvalidCredentialsError(),
  );
  public lastEmail: string | null = null;
  public lastRegisteredEmail: string | null = null;
  public lastRefreshToken: string | null = null;
  public signOutCalls = 0;

  public authenticate(
    email: Email,
    _password: Password,
  ): Promise<Result<AuthSession, AuthError>> {
    this.lastEmail = email.value;
    return Promise.resolve(this.authenticateResult);
  }

  public register(
    email: Email,
    _password: Password,
  ): Promise<Result<AuthSession, AuthError>> {
    this.lastRegisteredEmail = email.value;
    return Promise.resolve(this.registerResult);
  }

  public refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>> {
    this.lastRefreshToken = refreshToken;
    return Promise.resolve(this.refreshResult);
  }

  public signOut(_session: AuthSession): Promise<void> {
    this.signOutCalls += 1;
    return Promise.resolve();
  }
}
