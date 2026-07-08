import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import { type Result, ok, err, isOk } from '@core/result';
import { Email } from '@core/domain';
import {
  type AuthError,
  type AuthGateway,
  AuthSession,
  AuthenticatedUser,
  type Password,
  InvalidCredentialsError,
} from '../domain';

interface DemoUserSeed {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly string[];
  readonly userType: string;
}

/**
 * Demo accounts standing in for a backend directory. Any non-empty password is accepted for these
 * emails — this keeps the app a self-contained prototype. Swap `InMemoryAuthGateway` for
 * `AuthHttpGateway` in the auth module to authenticate against a real service (no other change).
 */
const DEMO_USERS: readonly DemoUserSeed[] = [
  {
    id: 'admin',
    email: 'admin@uapp.com',
    fullName: 'Md Shamim',
    roles: ['admin'],
    userType: 'Administrator',
  },
  {
    id: 'manager',
    email: 'manager@uapp.com',
    fullName: 'Raj Ahmed',
    roles: ['manager'],
    userType: 'Admission Manager',
  },
  {
    id: 'consultant',
    email: 'consultant@uapp.com',
    fullName: 'Simona',
    roles: ['consultant'],
    userType: 'Consultant',
  },
];

const SESSION_HOURS = 8;

export interface InMemoryAuthGatewayDeps {
  readonly clock: Clock;
  readonly logger: Logger;
}

/** In-memory {@link AuthGateway}: authenticates the demo users without a network round-trip. */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly usersByEmail: ReadonlyMap<string, AuthenticatedUser>;

  public constructor(deps: InMemoryAuthGatewayDeps) {
    this.clock = deps.clock;
    this.logger = deps.logger.child('in-memory-auth');
    this.usersByEmail = buildUserMap();
  }

  public authenticate(
    email: Email,
    _password: Password,
  ): Promise<Result<AuthSession, AuthError>> {
    const user = this.usersByEmail.get(email.value);
    if (user === undefined) {
      this.logger.warn('Rejected unknown demo account', { email: email.value });
      return Promise.resolve(err(new InvalidCredentialsError()));
    }
    return Promise.resolve(ok(this.issueSession(user)));
  }

  public refresh(refreshToken: string): Promise<Result<AuthSession, AuthError>> {
    const id = refreshToken.replace('demo-refresh-', '');
    for (const user of this.usersByEmail.values()) {
      if (user.id === id) {
        return Promise.resolve(ok(this.issueSession(user)));
      }
    }
    return Promise.resolve(err(new InvalidCredentialsError()));
  }

  public signOut(_session: AuthSession): Promise<void> {
    return Promise.resolve();
  }

  private issueSession(user: AuthenticatedUser): AuthSession {
    const expiresAt = new Date(
      this.clock.now().getTime() + SESSION_HOURS * 60 * 60 * 1000,
    );
    return new AuthSession({
      user,
      accessToken: `demo-access-${user.id}`,
      refreshToken: `demo-refresh-${user.id}`,
      tokenType: 'Bearer',
      expiresAt,
    });
  }
}

const buildUserMap = (): ReadonlyMap<string, AuthenticatedUser> => {
  const entries = new Map<string, AuthenticatedUser>();
  for (const seed of DEMO_USERS) {
    const email = Email.create(seed.email);
    if (isOk(email)) {
      const address = email.value;
      entries.set(
        address.value,
        new AuthenticatedUser({
          id: seed.id,
          email: address,
          fullName: seed.fullName,
          roles: seed.roles,
          userType: seed.userType,
        }),
      );
    }
  }
  return entries;
};
