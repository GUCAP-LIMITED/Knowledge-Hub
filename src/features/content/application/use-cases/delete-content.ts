import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { ContentError, ContentGateway } from '../../domain';

export interface DeleteContentUseCaseDeps {
  readonly contentGateway: ContentGateway;
  readonly logger: Logger;
}

/** Remove a content item from the library. */
export class DeleteContentUseCase {
  private readonly contentGateway: ContentGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteContentUseCaseDeps) {
    this.contentGateway = deps.contentGateway;
    this.logger = deps.logger.child('delete-content');
  }

  public async execute(id: string): Promise<Result<void, ContentError>> {
    const result = await this.contentGateway.remove(id);
    if (isErr(result)) {
      this.logger.warn('Deleting content failed', { id, code: result.error.code });
      return result;
    }
    this.logger.info('Content deleted', { id });
    return result;
  }
}
