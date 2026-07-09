export type UserRole = 'admin' | 'manager' | 'consultant';

export type UserStatus = 'active' | 'inactive';

export interface UserAccountProps {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly joined: string;
  readonly lastActive: string;
}

/**
 * A platform user account, managed from the admin Settings page. Immutable: every field is fixed
 * at construction so the presentation layer can rely on reference equality. Business questions
 * ("are they active?") are answered by the entity via {@link UserAccount.isActive} — never by a
 * component or store.
 */
export class UserAccount {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly status: UserStatus;
  public readonly joined: string;
  public readonly lastActive: string;

  public constructor(props: UserAccountProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.role = props.role;
    this.status = props.status;
    this.joined = props.joined;
    this.lastActive = props.lastActive;
  }

  /** Whether this account is currently active and may sign in. */
  public isActive(): boolean {
    return this.status === 'active';
  }
}
