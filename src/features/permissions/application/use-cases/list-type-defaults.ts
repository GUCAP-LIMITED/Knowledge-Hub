import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PermissionSetError,
  PermissionsGateway,
  UserTypeDefault,
} from '../../domain';

export interface ListTypeDefaultsUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** List each user type's bound default permission set. */
export class ListTypeDefaultsUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: ListTypeDefaultsUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('list-type-defaults');
  }

  public async execute(): Promise<
    Result<readonly UserTypeDefault[], PermissionSetError>
  > {
    const result = await this.permissionsGateway.typeDefaults();
    if (!result.ok) {
      this.logger.warn('Listing type defaults failed', { code: result.error.code });
    }
    return result;
  }
}
