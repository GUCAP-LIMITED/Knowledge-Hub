import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PagedResult,
  SelectableContentItem,
  SelectableContentParams,
  ReviewError,
  ReviewGateway,
} from '../../domain';

export interface GetSelectableContentItemsUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Fetch paginated selectable content items with database fuzzy search & enrollment gating. */
export class GetSelectableContentItemsUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: GetSelectableContentItemsUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('get-selectable-content-items');
  }

  public async execute(
    query?: SelectableContentParams,
  ): Promise<Result<PagedResult<SelectableContentItem>, ReviewError>> {
    const result = await this.reviewGateway.getSelectableContentItems(query);
    if (!result.ok) {
      this.logger.warn('Fetching selectable content items failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
