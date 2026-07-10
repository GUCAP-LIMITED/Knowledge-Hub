import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Resource,
  type ResourceError,
  type ResourceGateway,
  ResourceNotFoundError,
} from '../domain';
import { RESOURCE_SEED } from './resource-seed';

export interface InMemoryResourceGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link ResourceGateway}, seeded from the prototype knowledge base. A
 * legitimate infrastructure adapter (storage, not network) — it keeps the app a working prototype
 * with no backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryResourceGateway implements ResourceGateway {
  private readonly logger: Logger;
  private readonly resources: Map<string, Resource>;

  public constructor(deps: InMemoryResourceGatewayDeps) {
    this.logger = deps.logger.child('resource-gateway');
    this.resources = new Map(
      RESOURCE_SEED.map((props) => [props.id, new Resource(props)]),
    );
  }

  public list(): Promise<Result<readonly Resource[], ResourceError>> {
    return Promise.resolve(ok([...this.resources.values()]));
  }

  public getById(id: string): Promise<Result<Resource, ResourceError>> {
    const resource = this.resources.get(id);
    if (resource === undefined) {
      this.logger.warn('Resource not found', { id });
      return Promise.resolve(err(new ResourceNotFoundError(id)));
    }
    return Promise.resolve(ok(resource));
  }

  public markHelpful(id: string): Promise<Result<Resource, ResourceError>> {
    const resource = this.resources.get(id);
    if (resource === undefined) {
      return Promise.resolve(err(new ResourceNotFoundError(id)));
    }
    const updated = resource.withHelpful(resource.helpful + 1);
    this.resources.set(id, updated);
    return Promise.resolve(ok(updated));
  }

  public save(resource: Resource): Promise<Result<Resource, ResourceError>> {
    this.resources.set(resource.id, resource);
    return Promise.resolve(ok(resource));
  }

  public remove(id: string): Promise<Result<void, ResourceError>> {
    if (!this.resources.has(id)) {
      this.logger.warn('Resource not found for removal', { id });
      return Promise.resolve(err(new ResourceNotFoundError(id)));
    }
    this.resources.delete(id);
    return Promise.resolve(ok(undefined));
  }
}
