import { z } from 'zod';

/**
 * Wire contract for the permissions endpoints (`/api/app/my/permissions`, `/api/app/permission-sets`,
 * `/api/app/user-types/permission-defaults`, `/api/app/users/{id}/permissions`). Every response is
 * validated with Zod at the boundary.
 */

export interface PermissionModuleDto {
  readonly moduleId: string;
  readonly moduleName: string;
  readonly icon: string | null;
  readonly href: string | null;
  readonly basePermission: string;
  readonly isEnabled: boolean;
  readonly permissions: Record<string, boolean>;
  readonly children: readonly PermissionModuleDto[];
}

export const PermissionModuleDtoSchema: z.ZodType<PermissionModuleDto> = z.lazy(() =>
  z.object({
    moduleId: z.string(),
    moduleName: z.string(),
    icon: z.string().nullable(),
    href: z.string().nullable(),
    basePermission: z.string(),
    isEnabled: z.boolean(),
    permissions: z.record(z.boolean()),
    children: z.array(PermissionModuleDtoSchema),
  }),
);

export const MyPermissionsDtoSchema = z.record(z.boolean());

export interface PermissionModuleNavDto {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly sidebarMenu: string;
  readonly description: string;
  readonly basePermission: string;
  readonly href: string;
  readonly count: number | null;
  readonly children: readonly PermissionModuleNavDto[];
}

export const PermissionModuleNavDtoSchema: z.ZodType<PermissionModuleNavDto> = z.lazy(
  () =>
    z.object({
      id: z.string(),
      name: z.string(),
      icon: z.string(),
      sidebarMenu: z.string(),
      description: z.string(),
      basePermission: z.string(),
      href: z.string(),
      // `long?` on the wire — the key is always present (a number or null).
      count: z.number().nullable(),
      children: z.array(PermissionModuleNavDtoSchema),
    }),
);

export const PermissionModuleGroupDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  items: z.array(PermissionModuleNavDtoSchema),
});

export const MyPermissionModulesDtoSchema = z.array(PermissionModuleGroupDtoSchema);

export type PermissionModuleGroupDto = z.infer<typeof PermissionModuleGroupDtoSchema>;

export const PermissionSetSummaryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  color: z.string().nullish(),
  bgColor: z.string().nullish(),
  isSystemDefault: z.boolean(),
  enabledCount: z.number(),
  totalCount: z.number(),
});

export const PermissionSetListDtoSchema = z.union([
  z.array(PermissionSetSummaryDtoSchema),
  z.object({ items: z.array(PermissionSetSummaryDtoSchema) }),
]);

export const PermissionSetDetailDtoSchema = PermissionSetSummaryDtoSchema.extend({
  permissionModules: z.array(PermissionModuleDtoSchema),
});

export const UserTypeDefaultDtoSchema = z.object({
  userTypeId: z.string(),
  userTypeName: z.string(),
  permissionSetRoleId: z.string().nullish(),
  permissionSetName: z.string().nullish(),
  userCount: z.number(),
});

export const UserTypeDefaultListDtoSchema = z.union([
  z.array(UserTypeDefaultDtoSchema),
  z.object({ items: z.array(UserTypeDefaultDtoSchema) }),
]);

export const UserEffectivePermissionsDtoSchema = z.object({
  userId: z.string(),
  userName: z.string().nullish(),
  userTypeName: z.string().nullish(),
  permissionModules: z.array(PermissionModuleDtoSchema),
  directGrantedPermissions: z.array(z.string()),
  deniedPermissions: z.array(z.string()),
});

export const PermissionUpdateResultDtoSchema = z.object({
  added: z.array(z.string()),
  removed: z.array(z.string()),
  changedCount: z.number(),
});

export type PermissionSetDetailDto = z.infer<typeof PermissionSetDetailDtoSchema>;
export type PermissionSetSummaryDto = z.infer<typeof PermissionSetSummaryDtoSchema>;
export type UserTypeDefaultDto = z.infer<typeof UserTypeDefaultDtoSchema>;
export type UserEffectivePermissionsDto = z.infer<
  typeof UserEffectivePermissionsDtoSchema
>;
export type PermissionUpdateResultDto = z.infer<typeof PermissionUpdateResultDtoSchema>;
