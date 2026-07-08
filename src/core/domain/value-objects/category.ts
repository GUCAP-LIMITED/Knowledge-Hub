import { type Result, ok, err } from '@core/result';
import { InvalidCategoryError } from '../errors/invalid-category-error';

/** The approved content taxonomy. Shared across features, so it lives in the core kernel. */
export const CATEGORIES = [
  'Onboarding',
  'Compliance',
  'Sales',
  'Marketing',
  'Product',
  'Operations',
  'Leadership',
  'Technical',
  'Other',
] as const;

export type CategoryName = (typeof CATEGORIES)[number];

/**
 * Category value object. Immutable and self-validating: a `Category` is guaranteed to be one of the
 * approved {@link CATEGORIES}. Construct via `Category.create` (returns a `Result`).
 */
export class Category {
  private constructor(public readonly value: CategoryName) {}

  public static create(raw: string): Result<Category, InvalidCategoryError> {
    const normalized = raw.trim().toLowerCase();
    const match = CATEGORIES.find((candidate) => candidate.toLowerCase() === normalized);
    if (match === undefined) {
      return err(new InvalidCategoryError(raw));
    }
    return ok(new Category(match));
  }

  public equals(other: Category): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
