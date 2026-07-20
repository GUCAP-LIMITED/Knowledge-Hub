/** A user type badge on a directory row. */
export interface BranchUserType {
  readonly id: string;
  readonly name: string;
}

/** A branch a user is assigned to. */
export interface BranchAssignment {
  readonly branchId: string;
  readonly branchName: string;
  readonly isPrimary: boolean;
}

/**
 * A user in the directory — the read model backing `/settings/users`. Sourced from
 * `GET /api/app/branch/users` (`BranchUserDto`): only users with at least one branch assignment,
 * scoped to the caller's accessible branches.
 */
export interface BranchUser {
  readonly userId: string;
  readonly userName: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly isActive: boolean;
  readonly userTypes: readonly BranchUserType[];
  readonly branches: readonly BranchAssignment[];
  readonly profileImageUrl: string | null;
}

/** A branch option for the directory's branch filter dropdown. */
export interface BranchListItem {
  readonly id: string;
  readonly name: string;
}
