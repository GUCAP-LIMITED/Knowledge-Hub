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
}
