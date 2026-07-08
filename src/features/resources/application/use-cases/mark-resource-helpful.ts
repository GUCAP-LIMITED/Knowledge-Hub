import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Resource, ResourceError, ResourceGateway } from '../../domain';

export interface MarkResourceHelpfulUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/**
 * Register a helpful vote for a resource. The gateway owns persistence; the returned `Resource`
 * re-derives popularity from the new helpful count.
 */
export class MarkResourceHelpfulUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkResourceHelpfulUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('mark-resource-helpful');
  }

  public async execute(id: string): Promise<Result<Resource, ResourceError>> {
    const result = await this.resourceGateway.markHelpful(id);
    if (isErr(result)) {
      this.logger.warn('Marking resource helpful failed', {
        code: result.error.code,
        id,
      });
      return result;
    }
    this.logger.info('Resource marked helpful', { id, helpful: result.value.helpful });
    return result;
  }
}
