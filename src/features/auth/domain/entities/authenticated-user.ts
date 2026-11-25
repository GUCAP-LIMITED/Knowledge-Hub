import type { Email } from '@core/domain';

export interface AuthenticatedUserProps {
  readonly id: string;
  readonly email: Email;
  readonly fullName: string;
  readonly userType: string | null;
  readonly branchIds: readonly string[];
  readonly teamIds: readonly string[];
  readonly teamNames: readonly string[];
}

/**
 * The signed-in user. An entity (identity = `id`) that owns identity and profile data.
 * Authorization is not a client-side concern here — see `@features/permissions` for the
 * API-backed capability checks that gate routes and UI.
 */
export class AuthenticatedUser {
  public readonly id: string;
  public readonly email: Email;
  public readonly fullName: string;
  public readonly userType: string | null;
  /** Branches this user is assigned to; empty for host/global users. Drives the upload branch picker. */
  public readonly branchIds: readonly string[];
  public readonly teamIds: readonly string[];
  public readonly teamNames: readonly string[];

  public constructor(props: AuthenticatedUserProps) {
    if (props.id.trim().length === 0) {
      throw new Error('AuthenticatedUser requires a non-empty id.');
    }
    this.id = props.id;
    this.email = props.email;
    this.fullName = props.fullName.trim().length > 0 ? props.fullName : props.email.value;
    this.userType = props.userType;
    this.branchIds = props.branchIds;
    this.teamIds = props.teamIds;
    this.teamNames = props.teamNames;
  }

  public get displayTeamName(): string | null {
    if (this.teamNames.length === 1) {
      return this.teamNames[0] ?? null;
    }
    if (this.teamNames.length > 1) {
      return 'Multiple Teams';
    }
    return null;
  }
}
