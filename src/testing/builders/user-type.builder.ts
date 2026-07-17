import {
  type DataAccessScope,
  type UserTypeRoleRef,
  UserType,
} from '@features/user-types/domain';

export interface UserTypeOverrides {
  readonly id?: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
  readonly isAdmin?: boolean;
  readonly displayOrder?: number;
  readonly hierarchyLevel?: number;
  readonly dataAccessScope?: DataAccessScope;
  readonly isDefault?: boolean;
  readonly refId?: string | null;
  readonly createdAt?: Date;
  readonly roles?: readonly UserTypeRoleRef[];
}

const defaults = {
  id: 'user-type-1',
  name: 'Sample name',
  description: null,
  isActive: true,
  isAdmin: false,
  displayOrder: 0,
  hierarchyLevel: 0,
  dataAccessScope: 0,
  isDefault: false,
  refId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  roles: [],
} satisfies ConstructorParameters<typeof UserType>[0];

/** Construct a valid {@link UserType} for tests, overriding only what matters per case. */
export const buildUserType = (overrides: UserTypeOverrides = {}): UserType =>
  new UserType({ ...defaults, ...overrides });
