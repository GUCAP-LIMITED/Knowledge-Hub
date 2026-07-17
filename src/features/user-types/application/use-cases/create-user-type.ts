import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type CreateUserTypeInput,
  type UserType,
  type UserTypeError,
  type UserTypeGateway,
  UserTypeName,
} from '../../domain';

export interface CreateUserTypeUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/**
 * Create a user type. Validates the name via the domain value object before touching the gateway,
 * so the API only ever receives a well-formed name.
 */
export class CreateUserTypeUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: CreateUserTypeUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('create-user-type');
  }

  public async execute(
    input: CreateUserTypeInput,
  ): Promise<Result<UserType, UserTypeError>> {
    const name = UserTypeName.create(input.name);
    if (isErr(name)) {
      this.logger.warn('Rejected invalid user type name', { code: name.error.code });
      return name;
    }

    const result = await this.userTypeGateway.create({
      ...input,
      name: name.value.value,
    });
    if (isErr(result)) {
      this.logger.warn('Creating user type failed', { code: result.error.code });
    }
    return result;
  }
}
