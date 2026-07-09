import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type ContentError,
  type ContentGateway,
  type ContentItem,
  type ContentType,
  ContentTitle,
} from '../../domain';

export interface CreateContentInput {
  readonly title: string;
  readonly type: ContentType;
  readonly author: string;
}

export interface CreateContentUseCaseDeps {
  readonly contentGateway: ContentGateway;
  readonly logger: Logger;
}

/**
 * Create a content item from an authoring form. Validates the title via the domain value object,
 * then hands the gateway a `NewContentInput` — the item is created as a `draft`.
 */
export class CreateContentUseCase {
  private readonly contentGateway: ContentGateway;
  private readonly logger: Logger;

  public constructor(deps: CreateContentUseCaseDeps) {
    this.contentGateway = deps.contentGateway;
    this.logger = deps.logger.child('create-content');
  }

  public async execute(
    input: CreateContentInput,
  ): Promise<Result<ContentItem, ContentError>> {
    const title = ContentTitle.create(input.title);
    if (isErr(title)) {
      this.logger.warn('Rejected invalid content title', { code: title.error.code });
      return title;
    }

    const result = await this.contentGateway.create({
      title: title.value.value,
      type: input.type,
      author: input.author,
    });
    if (isErr(result)) {
      this.logger.warn('Creating content failed', { code: result.error.code });
      return result;
    }

    this.logger.info('Content created', { id: result.value.id });
    return result;
  }
}
