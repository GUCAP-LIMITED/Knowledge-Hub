import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  CreatePermissionSetUseCase,
  DeletePermissionSetUseCase,
  GetMyPermissionModulesUseCase,
  GetMyPermissionsUseCase,
  GetPermissionSetUseCase,
  ListPermissionSetsUseCase,
  ListTypeDefaultsUseCase,
  SetTypeDefaultUseCase,
  UpdatePermissionSetUseCase,
} from './application';
import { PermissionSetHttpGateway } from './infrastructure';

export interface PermissionsModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the permissions feature, consumed via the provider. */
export interface PermissionsModule {
  readonly getMyPermissions: GetMyPermissionsUseCase;
  readonly getMyPermissionModules: GetMyPermissionModulesUseCase;
  readonly listPermissionSets: ListPermissionSetsUseCase;
  readonly getPermissionSet: GetPermissionSetUseCase;
  readonly createPermissionSet: CreatePermissionSetUseCase;
  readonly updatePermissionSet: UpdatePermissionSetUseCase;
  readonly deletePermissionSet: DeletePermissionSetUseCase;
  readonly listTypeDefaults: ListTypeDefaultsUseCase;
  readonly setTypeDefault: SetTypeDefaultUseCase;
}

/**
 * Composition root *for the permissions feature*. Wires the concrete HTTP gateway to the use cases.
 * This is the only place inside the feature where layers are joined.
 */
export const createPermissionsModule = (
  deps: PermissionsModuleDeps,
): PermissionsModule => {
  const permissionsGateway = new PermissionSetHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  const shared = { permissionsGateway, logger: deps.logger };

  return {
    getMyPermissions: new GetMyPermissionsUseCase(shared),
    getMyPermissionModules: new GetMyPermissionModulesUseCase(shared),
    listPermissionSets: new ListPermissionSetsUseCase(shared),
    getPermissionSet: new GetPermissionSetUseCase(shared),
    createPermissionSet: new CreatePermissionSetUseCase(shared),
    updatePermissionSet: new UpdatePermissionSetUseCase(shared),
    deletePermissionSet: new DeletePermissionSetUseCase(shared),
    listTypeDefaults: new ListTypeDefaultsUseCase(shared),
    setTypeDefault: new SetTypeDefaultUseCase(shared),
  };
};
