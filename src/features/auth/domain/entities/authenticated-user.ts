import type { Email } from '@core/domain';

export interface AuthenticatedUserProps {
  readonly id: string;
  readonly email: Email;
  readonly fullName: string;
  readonly roles: readonly string[];
  readonly userType: string | null;
}

/**
 * The signed-in user. An entity (identity = `id`) that owns the rules about *what this user can
 * do* — role checks live here, not sprinkled across components as `user.roles.includes('admin')`.
 */
export class AuthenticatedUser {
  public readonly id: string;
  public readonly email: Email;
  public readonly fullName: string;
  public readonly userType: string | null;
  private readonly roles: ReadonlySet<string>;

  public constructor(props: AuthenticatedUserProps) {
    if (props.id.trim().length === 0) {
      throw new Error('AuthenticatedUser requires a non-empty id.');
    }
    this.id = props.id;
    this.email = props.email;
    this.fullName = props.fullName.trim().length > 0 ? props.fullName : props.email.value;
    this.userType = props.userType;
    this.roles = new Set(props.roles.map((role) => role.toLowerCase()));
  }

  public hasRole(role: string): boolean {
    return this.roles.has(role.toLowerCase());
  }

  public hasAnyRole(roles: readonly string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  public get roleNames(): readonly string[] {
    return [...this.roles];
  }
}
