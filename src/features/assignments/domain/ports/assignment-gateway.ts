import type { Result } from '@core/result';
import type { AssignmentError } from '../errors/assignment-errors';
import type { Assignment } from '../entities/assignment';
import type { AssignableUser, AssigneeCategory } from '../value-objects/assignee';

/** The data a new assignment carries at creation; the gateway assigns the id. */
export interface NewAssignmentInput {
  readonly contentItemId: string;
  readonly assignees: readonly {
    readonly category: AssigneeCategory;
    readonly targetId: string;
    readonly displayName: string;
  }[];
  readonly dueDate: Date;
  readonly status: 'active';
}

/** Optional query filters for listing assignments. Values map to the API's query string. */
export interface AssignmentListFilter {
  readonly status?: string;
  readonly search?: string;
  readonly skipCount?: number;
  readonly maxResultCount?: number;
}

export interface AssignmentListResult {
  readonly items: readonly Assignment[];
  readonly totalCount: number;
  readonly activeCount: number;
  readonly completedCount: number;
  readonly overdueCount: number;
}

/**
 * Port to the assignments store. The domain states the contract in its own terms (`Assignment`);
 * persistence details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface AssignmentGateway {
  /** Fetch assignments, optionally narrowed by filter. */
  list(
    filter?: AssignmentListFilter,
  ): Promise<Result<AssignmentListResult, AssignmentError>>;

  /** Create a new assignment and return it (with a generated id). */
  create(input: NewAssignmentInput): Promise<Result<Assignment, AssignmentError>>;

  /** Remove an assignment by id. */
  remove(id: string): Promise<Result<void, AssignmentError>>;

  /** Search or preload assignable users across the tenant. */
  searchUsers(
    filter?: string,
    maxResultCount?: number,
  ): Promise<Result<readonly AssignableUser[], AssignmentError>>;
}
