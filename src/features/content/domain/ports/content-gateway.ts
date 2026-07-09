import type { Result } from '@core/result';
import type { ContentError } from '../errors/content-errors';
import type { ContentItem, ContentType } from '../entities/content-item';

/** The data a new content item carries at creation; the gateway assigns id + timestamp + status. */
export interface NewContentInput {
  readonly title: string;
  readonly type: ContentType;
  readonly author: string;
}

/**
 * Port to the content library. The domain states the contract in its own terms (`ContentItem`);
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface ContentGateway {
  /** Fetch every content item. */
  list(): Promise<Result<readonly ContentItem[], ContentError>>;

  /** Fetch a single content item by id. */
  getById(id: string): Promise<Result<ContentItem, ContentError>>;

  /** Create a new content item and return it (with a generated id + timestamp). */
  create(input: NewContentInput): Promise<Result<ContentItem, ContentError>>;

  /** Persist an updated content item (after a domain transition) and return it. */
  save(item: ContentItem): Promise<Result<ContentItem, ContentError>>;

  /** Remove a content item by id. */
  remove(id: string): Promise<Result<void, ContentError>>;
}
