import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type PermissionSetDetail,
  type PermissionSetError,
  type PermissionsGateway,
  type UpdatePermissionSetInput,
  PermissionSetName,
} from '../../domain';

export interface UpdatePermissionSetUseCaseDeps {
  readonly permissionsGateway: PermissionsGateway;
  readonly logger: Logger;
}

/** Update a permission set's name and grants (send the full map — the backend diffs). */
export class UpdatePermissionSetUseCase {
  private readonly permissionsGateway: PermissionsGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdatePermissionSetUseCaseDeps) {
    this.permissionsGateway = deps.permissionsGateway;
    this.logger = deps.logger.child('update-permission-set');
  }

  public async execute(
    id: string,
    input: UpdatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    const name = PermissionSetName.create(input.name);
    if (isErr(name)) {
      this.logger.warn('Rejected invalid permission-set name', { code: name.error.code });
      return name;
    }
    const result = await this.permissionsGateway.updateSet(id, {
      ...input,
      name: name.value.value,
    });
    if (isErr(result)) {
      this.logger.warn('Updating permission set failed', { code: result.error.code });
    }
    return result;
  }
}
