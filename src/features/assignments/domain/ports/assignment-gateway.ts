import type { Result } from '@core/result';
import type { AssignmentError } from '../errors/assignment-errors';
import type { Assignment } from '../entities/assignment';

/** The data a new assignment carries at creation; the gateway assigns the id. */
export interface NewAssignmentInput {
  readonly course: string;
  readonly assignee: string;
  readonly dueDate: Date;
  readonly status: 'active';
}

/**
 * Port to the assignments store. The domain states the contract in its own terms (`Assignment`);
 * persistence details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface AssignmentGateway {
  /** Fetch every assignment. */
  list(): Promise<Result<readonly Assignment[], AssignmentError>>;

  /** Create a new assignment and return it (with a generated id). */
  create(input: NewAssignmentInput): Promise<Result<Assignment, AssignmentError>>;

  /** Remove an assignment by id. */
  remove(id: string): Promise<Result<void, AssignmentError>>;
}
