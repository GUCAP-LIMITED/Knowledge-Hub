import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Resource, ResourceError, ResourceGateway } from '../../domain';

export interface UpdateResourceInput {
  readonly id: string;
  readonly title: string;
  readonly category: string;
}

export interface UpdateResourceUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/** Edit a resource's title + category (admin, in-place in the knowledge base). */
export class UpdateResourceUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateResourceUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('update-resource');
  }

  public async execute(
    input: UpdateResourceInput,
  ): Promise<Result<Resource, ResourceError>> {
    const existing = await this.resourceGateway.getById(input.id);
    if (isErr(existing)) {
      this.logger.warn('Resource not found for update', { id: input.id });
      return existing;
    }
    return this.resourceGateway.save(
      existing.value.withDetails(input.title, input.category),
    );
  }
}
