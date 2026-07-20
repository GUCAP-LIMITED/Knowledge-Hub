import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PermissionsGateway,
  PermissionSetError,
  PermissionUpdateResult,
} from '../../domain';

export interface ReplaceUserDeniesUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Replace a user's full set of explicit permission denies (an empty list clears them). */
export class ReplaceUserDeniesUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: ReplaceUserDeniesUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('replace-user-denies');
  }

  public async execute(
    userId: string,
    deniedPermissions: readonly string[],
  ): Promise<Result<PermissionUpdateResult, PermissionSetError>> {
    const result = await this.permissionsGateway.replaceUserDenies(
      userId,
      deniedPermissions,
    );
    if (!result.ok) {
      this.logger.warn('Replacing user denies failed', { code: result.error.code });
    }
    return result;
  }
}
