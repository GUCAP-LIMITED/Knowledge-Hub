import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { ContentError, ContentGateway, ContentItem } from '../../domain';

export interface ListContentUseCaseDeps {
  readonly contentGateway: ContentGateway;
  readonly logger: Logger;
}

/** Fetch the whole content library. Pure orchestration: delegate to the gateway, return its `Result`. */
export class ListContentUseCase {
  private readonly contentGateway: ContentGateway;
  private readonly logger: Logger;

  public constructor(deps: ListContentUseCaseDeps) {
    this.contentGateway = deps.contentGateway;
    this.logger = deps.logger.child('list-content');
  }

  public async execute(): Promise<Result<readonly ContentItem[], ContentError>> {
    const result = await this.contentGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing content failed', { code: result.error.code });
    }
    return result;
  }
}
