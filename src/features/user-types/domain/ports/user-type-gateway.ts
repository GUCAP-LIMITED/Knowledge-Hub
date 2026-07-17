import type { Result } from '@core/result';
import type { UserTypeError } from '../errors/user-type-errors';
import type { DataAccessScope, UserType } from '../entities/user-type';
import type { SelectableUserType } from '../entities/selectable-user-type';

/** Fields an admin may set when creating a user type. `name` is pre-validated by the use case. */
export interface CreateUserTypeInput {
  readonly name: string;
  readonly description: string | null;
  readonly displayOrder: number;
  readonly isAdmin: boolean;
  readonly hierarchyLevel: number;
  readonly dataAccessScope: DataAccessScope;
}

/** Fields an admin may change on an existing (non-seeded) user type. */
export interface UpdateUserTypeInput {
  readonly name: string;
  readonly description: string | null;
  readonly displayOrder: number;
  readonly isActive: boolean;
  readonly isAdmin: boolean;
  readonly hierarchyLevel: number;
  readonly dataAccessScope: DataAccessScope;
}

/**
 * Port to the user-types service. The domain states the contract in its own terms; HTTP details
 * live in the infrastructure implementation. This is the Dependency Inversion seam.
 */
export interface UserTypeGateway {
  /** Every user type in the tenant (with attached roles). */
  list(): Promise<Result<readonly UserType[], UserTypeError>>;

  /** Create a custom user type. */
  create(input: CreateUserTypeInput): Promise<Result<UserType, UserTypeError>>;

  /** Update a custom user type (blocked for seeded types by the backend). */
  update(
    id: string,
    input: UpdateUserTypeInput,
  ): Promise<Result<UserType, UserTypeError>>;

  /** Re-position a type in the seniority chain (allowed on seeded types too). */
  reorder(id: string, hierarchyLevel: number): Promise<Result<UserType, UserTypeError>>;

  /** Delete a custom, unassigned user type. */
  remove(id: string): Promise<Result<void, UserTypeError>>;

  /** Lightweight options for a picker; `assignableOnly` restricts to types the caller may assign. */
  selectable(
    assignableOnly: boolean,
  ): Promise<Result<readonly SelectableUserType[], UserTypeError>>;
}
