import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PermissionMap,
  PermissionsGateway,
  PermissionSetError,
  PermissionUpdateResult,
} from '../../domain';

export interface UpdateUserGrantsUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Add or remove a user's direct ("U") permission grants (send only the toggled keys). */
export class UpdateUserGrantsUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateUserGrantsUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('update-user-grants');
  }

  public async execute(
    userId: string,
    permissions: PermissionMap,
  ): Promise<Result<PermissionUpdateResult, PermissionSetError>> {
    const result = await this.permissionsGateway.updateUserGrants(userId, permissions);
    if (!result.ok) {
      this.logger.warn('Updating user grants failed', { code: result.error.code });
    }
    return result;
  }
}
