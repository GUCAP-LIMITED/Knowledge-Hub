import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type UpdateUserTypeInput,
  type UserType,
  type UserTypeError,
  type UserTypeGateway,
  UserTypeName,
} from '../../domain';

export interface UpdateUserTypeUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/** Update a custom user type (the backend blocks seeded types). Validates the name first. */
export class UpdateUserTypeUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateUserTypeUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('update-user-type');
  }

  public async execute(
    id: string,
    input: UpdateUserTypeInput,
  ): Promise<Result<UserType, UserTypeError>> {
    const name = UserTypeName.create(input.name);
    if (isErr(name)) {
      this.logger.warn('Rejected invalid user type name', { code: name.error.code });
      return name;
    }

    const result = await this.userTypeGateway.update(id, {
      ...input,
      name: name.value.value,
    });
    if (isErr(result)) {
      this.logger.warn('Updating user type failed', { code: result.error.code });
    }
    return result;
  }
}
