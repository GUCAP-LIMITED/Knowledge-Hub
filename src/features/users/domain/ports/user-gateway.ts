import type { Result } from '@core/result';
import type { UserError } from '../errors/user-errors';
import type { UserAccount } from '../entities/user-account';

/**
 * Port to the user directory. The domain states the contract in its own terms (`UserAccount`);
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface UserGateway {
  /** Fetch every platform user account. */
  list(): Promise<Result<readonly UserAccount[], UserError>>;

  /** Fetch a single account by id. */
  getById(id: string): Promise<Result<UserAccount, UserError>>;

  /** Persist an updated account (after a status change) and return it. */
  save(user: UserAccount): Promise<Result<UserAccount, UserError>>;
}
