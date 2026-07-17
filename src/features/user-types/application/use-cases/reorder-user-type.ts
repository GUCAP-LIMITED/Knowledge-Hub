import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { UserType, UserTypeError, UserTypeGateway } from '../../domain';

export interface ReorderUserTypeUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/** Re-position a type in the seniority chain. The backend shifts neighbours and renumbers. */
export class ReorderUserTypeUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: ReorderUserTypeUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('reorder-user-type');
  }

  public async execute(
    id: string,
    hierarchyLevel: number,
  ): Promise<Result<UserType, UserTypeError>> {
    const result = await this.userTypeGateway.reorder(id, hierarchyLevel);
    if (!result.ok) {
      this.logger.warn('Reordering user type failed', { code: result.error.code });
    }
    return result;
  }
}
