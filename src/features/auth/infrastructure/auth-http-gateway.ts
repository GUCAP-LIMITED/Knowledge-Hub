import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import { type Result, err, isErr } from '@core/result';
import type { Email } from '@core/domain';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  type Password,
  AuthServiceUnavailableError,
  InvalidCredentialsError,
} from '../domain';
import { LoginResponseSchema } from './dto/auth-api.dto';
import { toAuthSession } from './auth-session-mapper';

const LOGIN_ENDPOINT = '/auth/login';
const REFRESH_ENDPOINT = '/auth/refresh';
const LOGOUT_ENDPOINT = '/auth/logout';

export interface AuthHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly clock: Clock;
  readonly logger: Logger;
}

/** HTTP implementation of the {@link AuthGateway} port against a JSON authentication API. */
export class AuthHttpGateway implements AuthGateway {
  private readonly httpClient: HttpClient;
  private readonly clock: Clock;
  private readonly logger: Logger;

  public constructor(deps: AuthHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.clock = deps.clock;
    this.logger = deps.logger.child('auth-gateway');
  }

  public authenticate(
    email: Email,
    password: Password,
  ): Promise<Result<AuthSession, AuthError>> {
    return this.requestSession(LOGIN_ENDPOINT, {
      email: email.value,
      password: password.value,
    });
  }

  public refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>> {
    return this.requestSession(REFRESH_ENDPOINT, { refreshToken });
  }

  public async signOut(session: AuthSession): Promise<void> {
    try {
      await this.httpClient.post<unknown>(
        LOGOUT_ENDPOINT,
        { refreshToken: session.refreshToken },
        { anonymous: true },
      );
    } catch (cause) {
      // Sign-out is best-effort: a failure here must never block local sign-out.
      this.logger.warn('Sign-out request failed; clearing local session anyway', {
        cause: cause instanceof Error ? cause.message : 'unknown',
      });
    }
  }

  private async requestSession(
    endpoint: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<Result<AuthSession, AuthError>> {
    try {
      const raw = await this.httpClient.post<unknown>(endpoint, body, {
        anonymous: true,
      });

      const parsed = LoginResponseSchema.safeParse(raw);
      if (!parsed.success) {
        this.logger.error('Login endpoint returned an unexpected shape', parsed.error);
        return err(new AuthServiceUnavailableError(parsed.error));
      }

      const session = toAuthSession(parsed.data, this.clock.now());
      if (isErr(session)) {
        this.logger.error('Could not map login response to a session', session.error);
      }
      return session;
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private mapError(cause: unknown): AuthError {
    if (cause instanceof HttpError && (cause.status === 400 || cause.status === 401)) {
      return new InvalidCredentialsError();
    }
    this.logger.error('Authentication request failed', cause);
    return new AuthServiceUnavailableError(cause);
  }
}
