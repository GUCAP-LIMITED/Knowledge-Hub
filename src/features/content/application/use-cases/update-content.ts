import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type ContentError,
  type ContentGateway,
  ContentItem,
  type ContentStatus,
  type ContentType,
  ContentTitle,
} from '../../domain';

export interface UpdateContentInput {
  readonly id: string;
  readonly title: string;
  readonly type: ContentType;
  readonly status: ContentStatus;
}

export interface UpdateContentUseCaseDeps {
  readonly contentGateway: ContentGateway;
  readonly logger: Logger;
}

/**
 * Edit an existing content item's title, type, and status from the management modal. Author,
 * creation date, and view count are preserved. The title is re-validated through its value object.
 */
export class UpdateContentUseCase {
  private readonly contentGateway: ContentGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateContentUseCaseDeps) {
    this.contentGateway = deps.contentGateway;
    this.logger = deps.logger.child('update-content');
  }

  public async execute(
    input: UpdateContentInput,
  ): Promise<Result<ContentItem, ContentError>> {
    const title = ContentTitle.create(input.title);
    if (isErr(title)) {
      this.logger.warn('Rejected invalid content title', { code: title.error.code });
      return title;
    }

    const existing = await this.contentGateway.getById(input.id);
    if (isErr(existing)) {
      this.logger.warn('Content not found for update', { id: input.id });
      return existing;
    }

    const updated = new ContentItem({
      id: existing.value.id,
      title: title.value.value,
      type: input.type,
      status: input.status,
      author: existing.value.author,
      createdAt: existing.value.createdAt,
      views: existing.value.views,
    });

    const result = await this.contentGateway.save(updated);
    if (isErr(result)) {
      this.logger.warn('Saving content failed', { code: result.error.code });
      return result;
    }

    this.logger.info('Content updated', { id: result.value.id });
    return result;
  }
}
