import { describe, expect, it } from 'vitest';
import type { PermissionSetDetailDto } from './dto/permission-set-api.dto';
import { toPermissionSetDetail } from './permission-set-mapper';

const dto: PermissionSetDetailDto = {
  id: 's1',
  name: 'FullAccess',
  description: 'Complete access',
  color: '#059669',
  bgColor: '#D1FAE5',
  isSystemDefault: true,
  enabledCount: 3,
  totalCount: 4,
  permissionModules: [
    {
      moduleId: 'courses',
      moduleName: 'Course Management',
      icon: 'BookOpen',
      href: '/courses',
      basePermission: 'Courses.View',
      isEnabled: true,
      permissions: { 'Courses.View': true, 'Courses.Delete': false },
      children: [],
    },
  ],
};

describe('toPermissionSetDetail', () => {
  it('maps summary fields and the module tree', () => {
    const detail = toPermissionSetDetail(dto);

    expect(detail.name).toBe('FullAccess');
    expect(detail.isSystemDefault).toBe(true);
    expect(detail.permissionModules[0]?.permissions['Courses.View']).toBe(true);
    expect(detail.permissionModules[0]?.permissions['Courses.Delete']).toBe(false);
  });

  it('coerces nullish description/color to null', () => {
    const detail = toPermissionSetDetail({
      ...dto,
      description: undefined,
      color: undefined,
    });
    expect(detail.description).toBeNull();
    expect(detail.color).toBeNull();
  });
});
