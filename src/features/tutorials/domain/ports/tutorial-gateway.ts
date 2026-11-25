import type { Result } from '@core/result';
import type { TutorialError } from '../errors/tutorial-errors';
import type { Tutorial } from '../entities/tutorial';

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
}

export interface TutorialCatalogParams {
  readonly filter?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly category?: string | undefined;
  readonly sorting?: string | undefined;
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
}

export interface EnumValue {
  readonly value: number;
  readonly name: string;
  readonly description: string;
}

/**
 * Port to the tutorials library. The domain states the contract in its own terms (`Tutorial`);
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface TutorialGateway {
  /** Fetch catalog of tutorials with filtering, sorting, and pagination. */
  list(
    params?: TutorialCatalogParams,
  ): Promise<Result<PagedResult<Tutorial>, TutorialError>>;

  /** Fetch a single tutorial by id. */
  getById(id: string): Promise<Result<Tutorial, TutorialError>>;

  /** Persist an edited tutorial (title/category) and return it. */
  save(tutorial: Tutorial): Promise<Result<Tutorial, TutorialError>>;

  /** Mark the tutorial as completed for the current learner (idempotent on the backend). */
  markComplete(id: string): Promise<Result<Tutorial, TutorialError>>;

  /** Mark an individual video asset complete for the current learner. */
  markVideoComplete(
    id: string,
    mediaAssetId: string,
  ): Promise<Result<Tutorial, TutorialError>>;

  /** Toggle or register a helpful vote for the current learner. */
  markHelpful(id: string): Promise<Result<Tutorial, TutorialError>>;

  /** Remove a tutorial by id. */
  remove(id: string): Promise<Result<void, TutorialError>>;

  /** Fetch enum values from the backend introspection endpoint. */
  getEnum(enumName: string): Promise<Result<readonly EnumValue[], TutorialError>>;
}
