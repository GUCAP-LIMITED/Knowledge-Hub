import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { UserAccount, UserError, UserGateway } from '../../domain';

export interface ListUsersUseCaseDeps {
  readonly userGateway: UserGateway;
  readonly logger: Logger;
}

/** Fetch the whole user directory. Pure orchestration: delegate to the gateway and return its `Result`. */
export class ListUsersUseCase {
  private readonly userGateway: UserGateway;
  private readonly logger: Logger;

  public constructor(deps: ListUsersUseCaseDeps) {
    this.userGateway = deps.userGateway;
    this.logger = deps.logger.child('list-users');
  }

  public async execute(): Promise<Result<readonly UserAccount[], UserError>> {
    const result = await this.userGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing users failed', { code: result.error.code });
    }
    return result;
  }
}
