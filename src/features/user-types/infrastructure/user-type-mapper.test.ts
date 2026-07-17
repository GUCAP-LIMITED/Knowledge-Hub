import { describe, expect, it } from 'vitest';
import type { UserTypeDto } from './dto/user-type-api.dto';
import { toUserType } from './user-type-mapper';

const dto: UserTypeDto = {
  id: 'ut-1',
  tenantId: null,
  name: 'Consultant',
  normalizedName: 'consultant',
  description: null,
  isActive: true,
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
