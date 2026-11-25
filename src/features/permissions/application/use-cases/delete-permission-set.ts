import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { PermissionSetError, PermissionsGateway } from '../../domain';

export interface DeletePermissionSetUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Delete a permission set (the backend blocks system defaults). */
export class DeletePermissionSetUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: DeletePermissionSetUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('delete-permission-set');
  }

  public async execute(id: string): Promise<Result<void, PermissionSetError>> {
    const result = await this.permissionsGateway.deleteSet(id);
    if (!result.ok) {
      this.logger.warn('Deleting permission set failed', { code: result.error.code });
    }
    return result;
  }
}
