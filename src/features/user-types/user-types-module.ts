import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  CreateUserTypeUseCase,
  DeleteUserTypeUseCase,
  ListSelectableUserTypesUseCase,
  ListUserTypesUseCase,
  ReorderUserTypeUseCase,
  UpdateUserTypeUseCase,
} from './application';
import { UserTypeHttpGateway } from './infrastructure';

export interface UserTypesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the user-types feature, consumed via the provider. */
export interface UserTypesModule {
  readonly listUserTypes: ListUserTypesUseCase;
  readonly createUserType: CreateUserTypeUseCase;
  readonly updateUserType: UpdateUserTypeUseCase;
  readonly reorderUserType: ReorderUserTypeUseCase;
  readonly deleteUserType: DeleteUserTypeUseCase;
  readonly listSelectableUserTypes: ListSelectableUserTypesUseCase;
}

/**
 * Composition root *for the user-types feature*. Wires the concrete HTTP gateway to the use cases.
 * This is the only place inside the feature where layers are joined.
 */
export const createUserTypesModule = (deps: UserTypesModuleDeps): UserTypesModule => {
  const userTypeGateway = new UserTypeHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  const shared = { userTypeGateway, logger: deps.logger };

  return {
    listUserTypes: new ListUserTypesUseCase(shared),
    createUserType: new CreateUserTypeUseCase(shared),
    updateUserType: new UpdateUserTypeUseCase(shared),
    reorderUserType: new ReorderUserTypeUseCase(shared),
    deleteUserType: new DeleteUserTypeUseCase(shared),
    listSelectableUserTypes: new ListSelectableUserTypesUseCase(shared),
  };
};
