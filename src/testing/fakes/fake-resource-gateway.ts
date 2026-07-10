import { type Result, ok } from '@core/result';
import type {
  Resource,
  ResourceError,
  ResourceGateway,
} from '@features/resources/domain';
import { buildResource } from '../builders/resource.builder';

/** Hand-written, fully-typed fake of the {@link ResourceGateway} port. */
export class FakeResourceGateway implements ResourceGateway {
  public listResult: Result<readonly Resource[], ResourceError> = ok([]);
  public getByIdResult: Result<Resource, ResourceError> = ok(buildResource());
  public markHelpfulResult: Result<Resource, ResourceError> = ok(
    buildResource({ helpful: 96 }),
  );

  public lastRequestedId: string | null = null;
  public lastMarkedHelpfulId: string | null = null;

  public list(): Promise<Result<readonly Resource[], ResourceError>> {
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

  public save(resource: Resource): Promise<Result<Resource, ResourceError>> {
    return Promise.resolve(ok(resource));
  }

  public remove(_id: string): Promise<Result<void, ResourceError>> {
    return Promise.resolve(ok(undefined));
  }
}
