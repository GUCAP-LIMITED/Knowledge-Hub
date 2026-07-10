import type { Result } from '@core/result';
import type { ResourceError } from '../errors/resource-errors';
import type { Resource } from '../entities/resource';

/**
 * Port to the knowledge base. The domain states the contract in its own terms (`Resource`);
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface ResourceGateway {
  /** Fetch every resource. */
  list(): Promise<Result<readonly Resource[], ResourceError>>;

  /** Fetch a single resource by id. */
  getById(id: string): Promise<Result<Resource, ResourceError>>;

  /** Register a helpful vote for a resource (increments by 1) and return the updated resource. */
  markHelpful(id: string): Promise<Result<Resource, ResourceError>>;

  /** Persist an edited resource (title/category) and return it. */
  save(resource: Resource): Promise<Result<Resource, ResourceError>>;

  /** Remove a resource by id. */
  remove(id: string): Promise<Result<void, ResourceError>>;
}
