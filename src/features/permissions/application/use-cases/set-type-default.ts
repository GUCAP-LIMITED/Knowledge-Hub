import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { PermissionSetError, PermissionsGateway } from '../../domain';

export interface SetTypeDefaultUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

export interface SetTypeDefaultInput {
  readonly userTypeId: string;
  readonly permissionSetRoleId: string;
  readonly applyToExistingUsers: boolean;
}

/** Bind a permission set as a user type's default. */
export class SetTypeDefaultUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: SetTypeDefaultUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('set-type-default');
  }

  public async execute(
    input: SetTypeDefaultInput,
  ): Promise<Result<void, PermissionSetError>> {
    const result = await this.permissionsGateway.setTypeDefault(
      input.userTypeId,
      input.permissionSetRoleId,
      input.applyToExistingUsers,
    );
    if (!result.ok) {
      this.logger.warn('Setting type default failed', { code: result.error.code });
    }
    return result;
  }
}
