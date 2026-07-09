import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import { type Result, ok, err } from '@core/result';
import {
  ContentItem,
  type ContentError,
  type ContentGateway,
  ContentNotFoundError,
  type NewContentInput,
} from '../domain';
import { CONTENT_SEED } from './content-seed';

export interface InMemoryContentGatewayDeps {
  readonly clock: Clock;
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link ContentGateway}, seeded from the prototype library. A legitimate
 * infrastructure adapter (storage, not network) — it keeps the app a working prototype with no
 * backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryContentGateway implements ContentGateway {
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly items: Map<string, ContentItem>;
  private counter: number;

  public constructor(deps: InMemoryContentGatewayDeps) {
    this.clock = deps.clock;
    this.logger = deps.logger.child('content-gateway');
    this.items = new Map(CONTENT_SEED.map((props) => [props.id, new ContentItem(props)]));
    this.counter = CONTENT_SEED.length;
  }

  public list(): Promise<Result<readonly ContentItem[], ContentError>> {
    return Promise.resolve(ok([...this.items.values()]));
  }

  public getById(id: string): Promise<Result<ContentItem, ContentError>> {
    const item = this.items.get(id);
    if (item === undefined) {
      this.logger.warn('Content not found', { id });
      return Promise.resolve(err(new ContentNotFoundError(id)));
    }
    return Promise.resolve(ok(item));
  }

  public create(input: NewContentInput): Promise<Result<ContentItem, ContentError>> {
    this.counter += 1;
    const id = `ct-${String(this.counter)}`;
    const item = new ContentItem({
      id,
      title: input.title,
      type: input.type,
      status: input.status ?? 'draft',
      author: input.author,
      createdAt: this.clock.now(),
      views: 0,
    });
    this.items.set(id, item);
    return Promise.resolve(ok(item));
  }

  public save(item: ContentItem): Promise<Result<ContentItem, ContentError>> {
    this.items.set(item.id, item);
    return Promise.resolve(ok(item));
  }

  public remove(id: string): Promise<Result<void, ContentError>> {
    if (!this.items.has(id)) {
      this.logger.warn('Content not found for removal', { id });
      return Promise.resolve(err(new ContentNotFoundError(id)));
    }
    this.items.delete(id);
    return Promise.resolve(ok(undefined));
  }
}
