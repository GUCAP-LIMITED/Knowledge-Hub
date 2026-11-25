import type { BranchListItem, BranchUser } from '../entities/branch-user';

/** Which users to list: a branch and/or user type, or everything accessible when both are null. */
export interface UserDirectoryFilter {
  readonly branchId: string | null;
  readonly userTypeId: string | null;
}

/** One server page of the directory plus the total across all pages. */
export interface BranchUserPage {
  readonly items: readonly BranchUser[];
  readonly totalCount: number;
}

/**
 * Port for the user-directory backend. Throws (rejects) on failure — the react-query hooks let
 * TanStack surface the error and the global mutation-cache turns it into a toast.
 */
export interface UserDirectoryGateway {
  /** Every matching user, fetched page by page until the server's total is reached. */
  listUsers(filter: UserDirectoryFilter): Promise<readonly BranchUser[]>;
  /** A single page of matching users (zero-based `page`). */
  listUsersPage(
    filter: UserDirectoryFilter,
    page: number,
    pageSize: number,
  ): Promise<BranchUserPage>;
  /** Branches for the filter dropdown. */
  listBranches(): Promise<readonly BranchListItem[]>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
}
