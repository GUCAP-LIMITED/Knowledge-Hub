import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { AssignableUser, AssignmentError, AssignmentGateway } from '../../domain';

export interface SearchAssignableUsersUseCaseDeps {
  readonly assignmentGateway: AssignmentGateway;
  readonly logger: Logger;
}

/**
 * Fetch or dynamically search assignable users across the tenant.
 */
export class SearchAssignableUsersUseCase {
  private readonly assignmentGateway: AssignmentGateway;
  private readonly logger: Logger;

  public constructor(deps: SearchAssignableUsersUseCaseDeps) {
    this.assignmentGateway = deps.assignmentGateway;
    this.logger = deps.logger.child('search-assignable-users');
  }

  public async execute(
    filter?: string,
    maxResultCount = 20,
  ): Promise<Result<readonly AssignableUser[], AssignmentError>> {
    this.logger.debug('Searching assignable users', { filter, maxResultCount });
    return this.assignmentGateway.searchUsers(filter, maxResultCount);
  }
}
