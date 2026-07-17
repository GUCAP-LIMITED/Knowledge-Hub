import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import { type Result, err } from '@core/result';
import {
  type AuthError,
  type AuthGateway,
  type AuthSession,
  AuthServiceUnavailableError,
  InvalidCredentialsError,
} from '../domain';
import { AcademyTokenResponseSchema } from './dto/academy-auth.dto';
import { decodeAccessToken, toSessionFromClaims } from './decode-jwt';

const TOKEN_ENDPOINT = '/connect/token';

export interface AcademyOAuthConfig {
  readonly clientId: string;
  readonly scope: string;
}

export interface AcademyAuthGatewayDeps {
  readonly httpClient: HttpClient;
  readonly clock: Clock;
  readonly logger: Logger;
  readonly oauth: AcademyOAuthConfig;
}

/**
 * Real Academy auth over OpenIddict. `exchangeSsoSecret` posts the Portal SSO secret to
 * `/connect/token` (custom `SsoSecret` grant); identity is decoded from the returned JWT. Refresh
 * uses the standard `refresh_token` grant. See `docs/implementation/00-overview.md`.
 */
export class AcademyAuthGateway implements AuthGateway {
  private readonly httpClient: HttpClient;
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly oauth: AcademyOAuthConfig;

  public constructor(deps: AcademyAuthGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.clock = deps.clock;
    this.logger = deps.logger.child('academy-auth-gateway');
    this.oauth = deps.oauth;
  }

  public exchangeSsoSecret(secret: string): Promise<Result<AuthSession, AuthError>> {
    return this.exchange({
      grant_type: 'SsoSecret',
      secret,
      client_id: this.oauth.clientId,
      scope: this.oauth.scope,
    });
  }

  public refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>> {
    return this.exchange({
      grant_type: 'refresh_token',
      client_id: this.oauth.clientId,
      refresh_token: refreshToken,
    });
  }

  public async signOut(): Promise<void> {
    // Best-effort: OpenIddict refresh tokens expire on their own; local sign-out clears the session.
    return Promise.resolve();
  }

  private async exchange(
    form: Readonly<Record<string, string>>,
  ): Promise<Result<AuthSession, AuthError>> {
    try {
      const raw = await this.httpClient.postForm<unknown>(TOKEN_ENDPOINT, form, {
        anonymous: true,
      });
      const parsed = AcademyTokenResponseSchema.safeParse(raw);
      if (!parsed.success) {
        this.logger.error('Token endpoint returned an unexpected shape', parsed.error);
        return err(new AuthServiceUnavailableError(parsed.error));
      }
      return toSessionFromClaims({
        claims: decodeAccessToken(parsed.data.access_token),
        accessToken: parsed.data.access_token,
        refreshToken: parsed.data.refresh_token ?? null,
        expiresIn: parsed.data.expires_in,
        now: this.clock.now(),
      });
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private mapError(cause: unknown): AuthError {
    if (cause instanceof HttpError && (cause.status === 400 || cause.status === 401)) {
      return new InvalidCredentialsError();
    }
    this.logger.error('Academy authentication failed', cause);
    return new AuthServiceUnavailableError(cause);
  }
}
