import { DomainError } from '@core/errors';

/**
 * Raised by the {@link Category} value object when given a value outside the approved taxonomy.
 * Lives in the shared kernel because Category is used by courses, tutorials, resources and content.
 */
export class InvalidCategoryError extends DomainError {
  public readonly code = 'INVALID_CATEGORY';

  public constructor(value: string) {
    super(`"${value}" is not a recognised category.`, { context: { value } });
  }
}
