import { describe, expect, it } from 'vitest';
import type { UserTypeDto } from './dto/user-type-api.dto';
import { toUserType, toUserTypeHierarchyNode } from './user-type-mapper';

const dto: UserTypeDto = {
  id: 'ut-1',
  tenantId: null,
  name: 'Consultant',
  normalizedName: 'consultant',
  description: null,
  canLogin: true,
  isAdmin: false,
  displayOrder: 5,
  hierarchyLevel: 1,
  dataAccessScope: 5,
  isDefault: true,
  refId: '13',
  creationTime: '2026-05-10T11:37:06.000Z',
  roles: [{ roleId: 'r1', roleName: 'Consultant' }],
};

describe('toUserType', () => {
  it('maps wire fields, narrows the scope, and parses the date', () => {
    const userType = toUserType(dto);

    expect(userType.id).toBe('ut-1');
    expect(userType.canLogin).toBe(true);
    expect(userType.dataAccessScope).toBe(5);
    expect(userType.isSeeded).toBe(true);
    expect(userType.isRanked).toBe(true);
    expect(userType.roles).toHaveLength(1);
    expect(userType.createdAt.getTime()).toBe(
      new Date('2026-05-10T11:37:06.000Z').getTime(),
    );
  });

  it('defaults an unknown scope integer to Self (0)', () => {
    expect(toUserType({ ...dto, dataAccessScope: 99 }).dataAccessScope).toBe(0);
  });
});

describe('toUserTypeHierarchyNode', () => {
  it('maps hierarchy node and recursively maps reports', () => {
    const node = toUserTypeHierarchyNode({
      userTypeId: 'ut-1',
      userTypeName: 'System Admin',
      hierarchyLevel: 14,
      canLogin: true,
      reportsTo: 'Top of Hierarchy',
      reports: [
        {
          userTypeId: 'ut-2',
          userTypeName: 'Admin',
          hierarchyLevel: 13,
          canLogin: false,
          reportsTo: 'System Admin',
          reports: [],
        },
      ],
    });

    expect(node.userTypeId).toBe('ut-1');
    expect(node.userTypeName).toBe('System Admin');
    expect(node.hierarchyLevel).toBe(14);
    expect(node.canLogin).toBe(true);
    expect(node.reportsTo).toBe('Top of Hierarchy');
    expect(node.reports).toHaveLength(1);
    expect(node.reports[0]?.userTypeId).toBe('ut-2');
    expect(node.reports[0]?.canLogin).toBe(false);
  });
});
