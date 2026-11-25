import { type Result, ok } from '@core/result';
import type {
  AssignableUser,
  Assignment,
  AssignmentError,
  AssignmentGateway,
  AssignmentListFilter,
  AssignmentListResult,
  NewAssignmentInput,
} from '@features/assignments/domain';
import { buildAssignment } from '../builders/assignment.builder';

/** Hand-written, fully-typed fake of the {@link AssignmentGateway} port. */
export class FakeAssignmentGateway implements AssignmentGateway {
  public listResult: Result<AssignmentListResult, AssignmentError> = ok({
    items: [],
    totalCount: 0,
    activeCount: 0,
    completedCount: 0,
    overdueCount: 0,
  });
  public createResult: Result<Assignment, AssignmentError> = ok(buildAssignment());
  public removeResult: Result<void, AssignmentError> = ok(undefined);
  public searchUsersResult: Result<readonly AssignableUser[], AssignmentError> = ok([]);

  public lastCreated: NewAssignmentInput | null = null;
  public lastRemovedId: string | null = null;
  public lastListFilter: AssignmentListFilter | undefined = undefined;
  public lastSearchFilter: string | undefined = undefined;

  public list(
    filter?: AssignmentListFilter,
  ): Promise<Result<AssignmentListResult, AssignmentError>> {
    this.lastListFilter = filter;
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

  public searchUsers(
    filter?: string,
    _maxResultCount?: number,
  ): Promise<Result<readonly AssignableUser[], AssignmentError>> {
    this.lastSearchFilter = filter;
    return Promise.resolve(this.searchUsersResult);
  }
}
