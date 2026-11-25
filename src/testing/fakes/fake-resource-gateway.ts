import { type Result, ok } from '@core/result';
import type {
  Resource,
  ResourceError,
  ResourceGateway,
  ResourceCatalogParams,
  PagedResult,
  ResourceStats,
} from '@features/resources/domain';
import { buildResource } from '../builders/resource.builder';

/** Hand-written, fully-typed fake of the {@link ResourceGateway} port. */
export class FakeResourceGateway implements ResourceGateway {
  public getStatsResult: Result<ResourceStats, ResourceError> = ok({
    totalCount: 0,
    categories: [],
  });
  public listResult: Result<PagedResult<Resource>, ResourceError> = ok({
    items: [],
    totalCount: 0,
  });
  public getByIdResult: Result<Resource, ResourceError> = ok(buildResource());
  public markHelpfulResult: Result<Resource, ResourceError> = ok(
    buildResource({ helpful: 96 }),
  );
  public markCompleteResult: Result<Resource, ResourceError> = ok(
    buildResource({ isCompleted: true }),
  );

  public lastRequestedId: string | null = null;
  public lastMarkedHelpfulId: string | null = null;
  public lastMarkedCompleteId: string | null = null;

  public getStats(): Promise<Result<ResourceStats, ResourceError>> {
    return Promise.resolve(this.getStatsResult);
  }

  public list(
    _params?: ResourceCatalogParams,
  ): Promise<Result<PagedResult<Resource>, ResourceError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<Resource, ResourceError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public markHelpful(id: string): Promise<Result<Resource, ResourceError>> {
    this.lastMarkedHelpfulId = id;
    return Promise.resolve(this.markHelpfulResult);
  }

  public markComplete(id: string): Promise<Result<Resource, ResourceError>> {
    this.lastMarkedCompleteId = id;
    return Promise.resolve(this.markCompleteResult);
  }

  public save(resource: Resource): Promise<Result<Resource, ResourceError>> {
    return Promise.resolve(ok(resource));
  }

  public remove(_id: string): Promise<Result<void, ResourceError>> {
    return Promise.resolve(ok(undefined));
  }
}
