import { type DataAccessScope, UserType } from '../domain';
import type { SelectableUserType } from '../domain';
import type { SelectableUserTypeDto, UserTypeDto } from './dto/user-type-api.dto';

/** Narrow the wire integer to the domain scope union without a cast. */
function toDataAccessScope(value: number): DataAccessScope {
  if (value === 10) return 10;
  if (value === 5) return 5;
  return 0;
}

/**
 * Translates the transport-level DTO into the domain UserType. All knowledge of how the API encodes
 * a user type (ISO dates, integer enums) lives here, keeping the domain free of wire concerns.
 */
export function toUserType(dto: UserTypeDto): UserType {
  return new UserType({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    isActive: dto.isActive,
    isAdmin: dto.isAdmin,
    displayOrder: dto.displayOrder,
    hierarchyLevel: dto.hierarchyLevel,
    dataAccessScope: toDataAccessScope(dto.dataAccessScope),
    isDefault: dto.isDefault,
    refId: dto.refId,
    createdAt: new Date(dto.creationTime),
    roles: dto.roles.map((r) => ({ roleId: r.roleId, roleName: r.roleName })),
  });
}

export function toSelectableUserType(dto: SelectableUserTypeDto): SelectableUserType {
  return {
    id: dto.id,
    name: dto.name,
    isActive: dto.isActive,
    hierarchyLevel: dto.hierarchyLevel,
    isDefault: dto.isDefault,
  };
}
