import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { ContentError, ContentGateway, ContentItem } from '../../domain';

export interface PublishContentUseCaseDeps {
  readonly contentGateway: ContentGateway;
  readonly logger: Logger;
}

/** Publish a content item: load it, apply the domain transition, then persist the result. */
export class PublishContentUseCase {
  private readonly contentGateway: ContentGateway;
  private readonly logger: Logger;

  public constructor(deps: PublishContentUseCaseDeps) {
    this.contentGateway = deps.contentGateway;
    this.logger = deps.logger.child('publish-content');
  }

  public async execute(id: string): Promise<Result<ContentItem, ContentError>> {
    const found = await this.contentGateway.getById(id);
    if (isErr(found)) {
      return found;
    }
    const published = found.value.publish();
    if (isErr(published)) {
      this.logger.warn('Publish rejected by domain', { id, code: published.error.code });
      return published;
    }
    return this.contentGateway.save(published.value);
  }
}
