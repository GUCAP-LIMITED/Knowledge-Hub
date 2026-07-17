import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { UserType, UserTypeError, UserTypeGateway } from '../../domain';

export interface ListUserTypesUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/** Fetch every userType. Pure orchestration: delegate to the gateway and return its Result. */
export class ListUserTypesUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: ListUserTypesUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('list-user-types');
  }

  public async execute(): Promise<Result<readonly UserType[], UserTypeError>> {
    const result = await this.userTypeGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing user-types failed', { code: result.error.code });
    }
    return result;
  }
}
