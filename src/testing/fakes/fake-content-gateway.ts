import { type Result, ok } from '@core/result';
import type {
  ContentError,
  ContentGateway,
  ContentItem,
  NewContentInput,
} from '@features/content/domain';
import { buildContentItem } from '../builders/content-item.builder';

/** Hand-written, fully-typed fake of the {@link ContentGateway} port. */
export class FakeContentGateway implements ContentGateway {
  public listResult: Result<readonly ContentItem[], ContentError> = ok([]);
  public getByIdResult: Result<ContentItem, ContentError> = ok(buildContentItem());
  public createResult: Result<ContentItem, ContentError> = ok(buildContentItem());
  public saveResult: Result<ContentItem, ContentError> = ok(buildContentItem());
  public removeResult: Result<void, ContentError> = ok(undefined);

  public lastCreated: NewContentInput | null = null;
  public lastSaved: ContentItem | null = null;
  public lastRequestedId: string | null = null;
  public lastRemovedId: string | null = null;

  public list(): Promise<Result<readonly ContentItem[], ContentError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<ContentItem, ContentError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public create(input: NewContentInput): Promise<Result<ContentItem, ContentError>> {
    this.lastCreated = input;
    return Promise.resolve(this.createResult);
  }

  public save(item: ContentItem): Promise<Result<ContentItem, ContentError>> {
    this.lastSaved = item;
    return Promise.resolve(this.saveResult);
  }

  public remove(id: string): Promise<Result<void, ContentError>> {
    this.lastRemovedId = id;
    return Promise.resolve(this.removeResult);
  }
}
