import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { UserTypeError, UserTypeGateway, UserTypeHierarchyNode } from '../../domain';

export interface GetUserTypeHierarchyUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/** Fetch user-type hierarchy tree. */
export class GetUserTypeHierarchyUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: GetUserTypeHierarchyUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('get-user-type-hierarchy');
  }

  public async execute(
    canLogin?: boolean,
  ): Promise<Result<readonly UserTypeHierarchyNode[], UserTypeError>> {
    const result = await this.userTypeGateway.hierarchy(canLogin);
    if (!result.ok) {
      this.logger.warn('Fetching user-type hierarchy failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
