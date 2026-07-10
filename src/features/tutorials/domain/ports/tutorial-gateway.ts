import type { Result } from '@core/result';
import type { TutorialError } from '../errors/tutorial-errors';
import type { Tutorial } from '../entities/tutorial';

/**
 * Port to the tutorials library. The domain states the contract in its own terms (`Tutorial`);
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface TutorialGateway {
  /** Fetch every tutorial. */
  list(): Promise<Result<readonly Tutorial[], TutorialError>>;

  /** Fetch a single tutorial by id. */
  getById(id: string): Promise<Result<Tutorial, TutorialError>>;

  /** Persist an edited tutorial (title/category) and return it. */
  save(tutorial: Tutorial): Promise<Result<Tutorial, TutorialError>>;

  /** Remove a tutorial by id. */
  remove(id: string): Promise<Result<void, TutorialError>>;
}
