import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { PermissionMap, PermissionSetError, PermissionsGateway } from '../../domain';

export interface GetMyPermissionsUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Load the caller's effective permission map (drives capability gating). */
export class GetMyPermissionsUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyPermissionsUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('get-my-permissions');
  }

  public async execute(): Promise<Result<PermissionMap, PermissionSetError>> {
    const result = await this.permissionsGateway.myPermissions();
    if (!result.ok) {
      this.logger.warn('Loading my permissions failed', { code: result.error.code });
    }
    return result;
  }
}
