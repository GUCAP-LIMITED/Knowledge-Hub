import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { UserAccount, UserError, UserGateway, UserStatus } from '../../domain';

export interface SetUserStatusInput {
  readonly id: string;
  readonly status: UserStatus;
}

export interface SetUserStatusUseCaseDeps {
  readonly userGateway: UserGateway;
  readonly logger: Logger;
}

/**
 * Activate or deactivate a platform user from the admin Settings page. Loads the account, applies
 * the immutable status transition, and persists it. Returns the updated account.
 */
export class SetUserStatusUseCase {
  private readonly userGateway: UserGateway;
  private readonly logger: Logger;

  public constructor(deps: SetUserStatusUseCaseDeps) {
    this.userGateway = deps.userGateway;
    this.logger = deps.logger.child('set-user-status');
  }

  public async execute(
    input: SetUserStatusInput,
  ): Promise<Result<UserAccount, UserError>> {
    const existing = await this.userGateway.getById(input.id);
    if (isErr(existing)) {
      this.logger.warn('User not found for status change', { id: input.id });
      return existing;
    }

    const result = await this.userGateway.save(existing.value.withStatus(input.status));
    if (isErr(result)) {
      this.logger.warn('Saving user status failed', { code: result.error.code });
      return result;
    }

    this.logger.info('User status changed', { id: input.id, status: input.status });
    return result;
  }
}
