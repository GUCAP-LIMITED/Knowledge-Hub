import type {
  PermissionModule,
  PermissionSetDetail,
  PermissionSetSummary,
  SidebarGroup,
  SidebarModule,
  UserEffectivePermissions,
  UserTypeDefault,
} from '../domain';
import type {
  PermissionModuleDto,
  PermissionModuleGroupDto,
  PermissionModuleNavDto,
  PermissionSetDetailDto,
  PermissionSetSummaryDto,
  UserEffectivePermissionsDto,
  UserTypeDefaultDto,
} from './dto/permission-set-api.dto';

function toModule(dto: PermissionModuleDto): PermissionModule {
  return {
    moduleId: dto.moduleId,
    moduleName: dto.moduleName,
    icon: dto.icon ?? null,
    href: dto.href ?? null,
    basePermission: dto.basePermission,
    isEnabled: dto.isEnabled,
    permissions: dto.permissions,
    children: dto.children.map(toModule),
  };
}

export function toPermissionSetSummary(
  dto: PermissionSetSummaryDto,
): PermissionSetSummary {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? null,
    color: dto.color ?? null,
    bgColor: dto.bgColor ?? null,
    isSystemDefault: dto.isSystemDefault,
    enabledCount: dto.enabledCount,
    totalCount: dto.totalCount,
  };
}

export function toPermissionSetDetail(dto: PermissionSetDetailDto): PermissionSetDetail {
  return {
    ...toPermissionSetSummary(dto),
    permissionModules: dto.permissionModules.map(toModule),
  };
}

function toSidebarModule(dto: PermissionModuleNavDto): SidebarModule {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon.length > 0 ? dto.icon : null,
    sidebarMenu: dto.sidebarMenu,
    href: dto.href,
    count: dto.count ?? null,
    children: dto.children.map(toSidebarModule),
  };
}

export function toSidebarGroup(dto: PermissionModuleGroupDto): SidebarGroup {
  return { id: dto.id, label: dto.label, items: dto.items.map(toSidebarModule) };
}

export function toUserTypeDefault(dto: UserTypeDefaultDto): UserTypeDefault {
  return {
    userTypeId: dto.userTypeId,
    userTypeName: dto.userTypeName,
    permissionSetRoleId: dto.permissionSetRoleId ?? null,
    permissionSetName: dto.permissionSetName ?? null,
    userCount: dto.userCount,
  };
}

export function toUserEffectivePermissions(
  dto: UserEffectivePermissionsDto,
): UserEffectivePermissions {
  return {
    userId: dto.userId,
    userName: dto.userName ?? null,
    userTypeName: dto.userTypeName ?? null,
    permissionModules: dto.permissionModules.map(toModule),
    directGrantedPermissions: dto.directGrantedPermissions,
    deniedPermissions: dto.deniedPermissions,
  };
}
