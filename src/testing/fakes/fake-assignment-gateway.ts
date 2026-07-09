import { type Result, ok } from '@core/result';
import type {
  Assignment,
  AssignmentError,
  AssignmentGateway,
  NewAssignmentInput,
} from '@features/assignments/domain';
import { buildAssignment } from '../builders/assignment.builder';

/** Hand-written, fully-typed fake of the {@link AssignmentGateway} port. */
export class FakeAssignmentGateway implements AssignmentGateway {
  public listResult: Result<readonly Assignment[], AssignmentError> = ok([]);
  public createResult: Result<Assignment, AssignmentError> = ok(buildAssignment());
  public removeResult: Result<void, AssignmentError> = ok(undefined);

  public lastCreated: NewAssignmentInput | null = null;
  public lastRemovedId: string | null = null;

  public list(): Promise<Result<readonly Assignment[], AssignmentError>> {
    return Promise.resolve(this.listResult);
  }

  public create(input: NewAssignmentInput): Promise<Result<Assignment, AssignmentError>> {
    this.lastCreated = input;
    return Promise.resolve(this.createResult);
  }

  public remove(id: string): Promise<Result<void, AssignmentError>> {
    this.lastRemovedId = id;
    return Promise.resolve(this.removeResult);
  }
}
