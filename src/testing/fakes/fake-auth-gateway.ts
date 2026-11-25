import { type Result, err } from '@core/result';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  InvalidCredentialsError,
} from '@features/auth/domain';

/** Hand-written, fully-typed fake of the {@link AuthGateway} port (SSO-only). */
export class FakeAuthGateway implements AuthGateway {
  public exchangeResult: Result<AuthSession, AuthError> = err(
    new InvalidCredentialsError(),
  );
  public refreshResult: Result<AuthSession, AuthError> = err(
    new InvalidCredentialsError(),
  );
  public lastSecret: string | null = null;
  public lastRefreshToken: string | null = null;
  public signOutCalls = 0;

  public exchangeSsoSecret(secret: string): Promise<Result<AuthSession, AuthError>> {
    this.lastSecret = secret;
    return Promise.resolve(this.exchangeResult);
  }

  public refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>> {
    this.lastRefreshToken = refreshToken;
    return Promise.resolve(this.refreshResult);
  }

  public signOut(): Promise<void> {
    this.signOutCalls += 1;
    return Promise.resolve();
  }
}
