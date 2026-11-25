import type { Result } from '@core/result';
import type { ResourceError } from '../errors/resource-errors';
import type { Resource } from '../entities/resource';
import type { ResourceStats } from '../entities/resource-stats';

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
}

export interface ResourceCatalogParams {
  readonly filter?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly category?: string | undefined;
  readonly sorting?: string | undefined;
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
}

/**
 * Port to the knowledge base. The domain states the contract in its own terms (`Resource`);
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface ResourceGateway {
  /** Fetch aggregate statistics including total count and per-category counts. */
  getStats(): Promise<Result<ResourceStats, ResourceError>>;

  /** Fetch catalog of resources with filtering, sorting, and pagination. */
  list(
    params?: ResourceCatalogParams,
  ): Promise<Result<PagedResult<Resource>, ResourceError>>;

  /** Fetch a single resource by id. */
  getById(id: string): Promise<Result<Resource, ResourceError>>;

  /** Register a helpful vote for a resource (increments by 1) and return the updated resource. */
  markHelpful(id: string): Promise<Result<Resource, ResourceError>>;

  /** Mark a resource as completed/downloaded for the current learner; issues a certificate. */
  markComplete(id: string): Promise<Result<Resource, ResourceError>>;

  /** Persist an edited resource (title/category) and return it. */
  save(resource: Resource): Promise<Result<Resource, ResourceError>>;

  /** Remove a resource by id. */
  remove(id: string): Promise<Result<void, ResourceError>>;
}
