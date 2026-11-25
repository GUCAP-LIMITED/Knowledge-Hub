import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PermissionsGateway,
  PermissionSetError,
  UserEffectivePermissions,
} from '../../domain';

export interface GetUserPermissionsUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Load one user's effective permission tree plus their direct grants and denies. */
export class GetUserPermissionsUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: GetUserPermissionsUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('get-user-permissions');
  }

  public async execute(
    userId: string,
  ): Promise<Result<UserEffectivePermissions, PermissionSetError>> {
    const result = await this.permissionsGateway.userPermissions(userId);
    if (!result.ok) {
      this.logger.warn('Loading user permissions failed', { code: result.error.code });
    }
    return result;
  }
}
