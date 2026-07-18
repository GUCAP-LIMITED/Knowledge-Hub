import { type Result, ok, isErr } from '@core/result';
import { Email, type InvalidEmailError } from '@core/domain';
import { AuthenticatedUser } from './authenticated-user';

export interface AuthSessionProps {
  readonly user: AuthenticatedUser;
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly tokenType: string;
  readonly expiresAt: Date;
}

/** Plain, serializable form used to persist/restore a session across reloads. */
export interface AuthSessionSnapshot {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly roles: readonly string[];
    readonly userType: string | null;
    readonly branchIds?: readonly string[]; // optional: absent in sessions persisted before this field existed
  };
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly tokenType: string;
  readonly expiresAtIso: string;
}

/** Sessions within this window of expiry are treated as needing a refresh. */
const EXPIRY_SKEW_SECONDS = 30;

/**
 * Aggregate root of the auth feature: an authenticated session and everything it knows about its
 * own validity. Token lifetime logic lives here so no component or store re-implements "is this
 * token still good?".
 */
export class AuthSession {
  public readonly user: AuthenticatedUser;
  public readonly accessToken: string;
  public readonly refreshToken: string | null;
  public readonly tokenType: string;
  public readonly expiresAt: Date;

  public constructor(props: AuthSessionProps) {
    this.user = props.user;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
    this.tokenType = props.tokenType;
    this.expiresAt = props.expiresAt;
  }

  public isExpired(now: Date): boolean {
    return this.expiresAt.getTime() - EXPIRY_SKEW_SECONDS * 1000 <= now.getTime();
  }

  public isValid(now: Date): boolean {
    return this.accessToken.length > 0 && !this.isExpired(now);
  }

  public get canRefresh(): boolean {
    return this.refreshToken !== null && this.refreshToken.length > 0;
  }

  public authorizationHeader(): string {
    return `${this.tokenType} ${this.accessToken}`;
  }

  public snapshot(): AuthSessionSnapshot {
    return {
      user: {
        id: this.user.id,
        email: this.user.email.value,
        fullName: this.user.fullName,
        roles: this.user.roleNames,
        userType: this.user.userType,
        branchIds: this.user.branchIds,
      },
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenType: this.tokenType,
      expiresAtIso: this.expiresAt.toISOString(),
    };
  }

  public static restore(
    snapshot: AuthSessionSnapshot,
  ): Result<AuthSession, InvalidEmailError> {
    const email = Email.create(snapshot.user.email);
    if (isErr(email)) {
      return email;
    }

    const user = new AuthenticatedUser({
      id: snapshot.user.id,
      email: email.value,
      fullName: snapshot.user.fullName,
      roles: snapshot.user.roles,
      userType: snapshot.user.userType,
      branchIds: snapshot.user.branchIds ?? [],
    });

    return ok(
      new AuthSession({
        user,
        accessToken: snapshot.accessToken,
        refreshToken: snapshot.refreshToken,
        tokenType: snapshot.tokenType,
        expiresAt: new Date(snapshot.expiresAtIso),
      }),
    );
  }
}
