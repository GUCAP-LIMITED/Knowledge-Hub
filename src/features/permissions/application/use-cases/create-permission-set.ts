import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type CreatePermissionSetInput,
  type PermissionSetDetail,
  type PermissionSetError,
  type PermissionsGateway,
  PermissionSetName,
} from '../../domain';

export interface CreatePermissionSetUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Create a permission set. Validates the name via the value object before touching the gateway. */
export class CreatePermissionSetUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: CreatePermissionSetUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('create-permission-set');
  }

  public async execute(
    input: CreatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    const name = PermissionSetName.create(input.name);
    if (isErr(name)) {
      this.logger.warn('Rejected invalid permission-set name', { code: name.error.code });
      return name;
    }
    const result = await this.permissionsGateway.createSet({
      ...input,
      name: name.value.value,
    });
    if (isErr(result)) {
      this.logger.warn('Creating permission set failed', { code: result.error.code });
    }
    return result;
  }
}
