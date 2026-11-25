import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PermissionSetError,
  PermissionSetSummary,
  PermissionsGateway,
} from '../../domain';

export interface ListPermissionSetsUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** List the tenant's permission sets. */
export class ListPermissionSetsUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: ListPermissionSetsUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('list-permission-sets');
  }

  public async execute(): Promise<
    Result<readonly PermissionSetSummary[], PermissionSetError>
  > {
    const result = await this.permissionsGateway.listSets();
    if (!result.ok) {
      this.logger.warn('Listing permission sets failed', { code: result.error.code });
    }
    return result;
  }
}
