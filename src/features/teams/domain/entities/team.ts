/** A member slot: the UserType by its id, with its display name resolved for the tenant. */
export interface TeamMember {
  readonly userTypeId: string;
  readonly userTypeName: string | null;
}

/** A team — a named group of UserTypes that drives Team-visibility content sharing. */
export interface Team {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly members: readonly TeamMember[];
}

/** A UserType option for the team-member picker. */
export interface SelectableUserType {
  readonly id: string;
  readonly name: string;
}

/** Create/update payload — replaces the member set on update. */
export interface CreateTeamInput {
  readonly name: string;
  readonly description: string | null;
  readonly userTypeIds: readonly string[];
}

export type UpdateTeamInput = CreateTeamInput;
