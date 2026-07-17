import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PermissionSetDetail,
  PermissionSetError,
  PermissionsGateway,
} from '../../domain';

export interface GetPermissionSetUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Load one permission set with its full toggle tree. */
export class GetPermissionSetUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: GetPermissionSetUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('get-permission-set');
  }

  public async execute(
    id: string,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    const result = await this.permissionsGateway.getSet(id);
    if (!result.ok) {
      this.logger.warn('Loading permission set failed', { code: result.error.code });
    }
    return result;
  }
}
