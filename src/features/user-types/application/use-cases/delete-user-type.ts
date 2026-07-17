import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { UserTypeError, UserTypeGateway } from '../../domain';

export interface DeleteUserTypeUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/** Delete a custom, unassigned user type. Seeded / in-use types are rejected by the backend. */
export class DeleteUserTypeUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteUserTypeUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('delete-user-type');
  }

  public async execute(id: string): Promise<Result<void, UserTypeError>> {
    const result = await this.userTypeGateway.remove(id);
    if (!result.ok) {
      this.logger.warn('Deleting user type failed', { code: result.error.code });
    }
    return result;
  }
}
