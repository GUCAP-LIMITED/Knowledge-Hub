import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { PermissionSetError, PermissionsGateway, SidebarGroup } from '../../domain';

export interface GetMyPermissionModulesUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Load the caller's accessible sidebar modules (drives the left nav). */
export class GetMyPermissionModulesUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyPermissionModulesUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('get-my-permission-modules');
  }

  public async execute(): Promise<Result<readonly SidebarGroup[], PermissionSetError>> {
    const result = await this.permissionsGateway.myPermissionModules();
    if (!result.ok) {
      this.logger.warn('Loading my permission modules failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
