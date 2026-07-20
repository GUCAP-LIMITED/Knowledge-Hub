import type { BranchListItem, BranchUser } from '../entities/branch-user';

/**
 * Port for the user-directory backend. Throws (rejects) on failure — the react-query hooks let
 * TanStack surface the error and the global mutation-cache turns it into a toast.
 */
export interface UserDirectoryGateway {
  /** Users in a branch, or across all accessible branches when `branchId` is null. */
  listUsers(branchId: string | null): Promise<readonly BranchUser[]>;
  /** Branches for the filter dropdown. */
  listBranches(): Promise<readonly BranchListItem[]>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
}
