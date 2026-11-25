import { describe, expect, it } from 'vitest';
import type {
  PermissionModuleGroupDto,
  PermissionSetDetailDto,
} from './dto/permission-set-api.dto';
import { toPermissionSetDetail, toSidebarGroup } from './permission-set-mapper';

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

const groupDto: PermissionModuleGroupDto = {
  id: 'administration',
  label: 'Administration',
  items: [
    {
      id: 'settings',
      name: 'Settings',
      icon: 'Settings',
      sidebarMenu: 'Settings',
      description: 'Platform configuration',
      basePermission: 'Settings.View',
      href: '/settings',
      count: null,
      children: [
        {
          id: 'user-types',
          name: 'User Types',
          icon: 'UserCog',
          sidebarMenu: 'User Types',
          description: 'Manage user types and their defaults',
          basePermission: 'UserTypes.View',
          href: '/settings/users/user-types',
          count: null,
          children: [],
        },
      ],
    },
  ],
};

describe('toSidebarGroup', () => {
  it('carries basePermission through onto the sidebar module', () => {
    const group = toSidebarGroup(groupDto);
    expect(group.items[0]?.basePermission).toBe('Settings.View');
  });

  it('carries basePermission through nested children', () => {
    const group = toSidebarGroup(groupDto);
    expect(group.items[0]?.children[0]?.basePermission).toBe('UserTypes.View');
  });
});
