import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { SelectableUserType, UserTypeError, UserTypeGateway } from '../../domain';

export interface ListSelectableUserTypesUseCaseDeps {
  readonly userTypeGateway: UserTypeGateway;
  readonly logger: Logger;
}

/** Options for an "assign type" picker; `assignableOnly` limits to what the caller may assign. */
export class ListSelectableUserTypesUseCase {
  private readonly userTypeGateway: UserTypeGateway;
  private readonly logger: Logger;

  public constructor(deps: ListSelectableUserTypesUseCaseDeps) {
    this.userTypeGateway = deps.userTypeGateway;
    this.logger = deps.logger.child('list-selectable-user-types');
  }

  public async execute(
    assignableOnly: boolean,
  ): Promise<Result<readonly SelectableUserType[], UserTypeError>> {
    const result = await this.userTypeGateway.selectable(assignableOnly);
    if (!result.ok) {
      this.logger.warn('Listing selectable user-types failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
