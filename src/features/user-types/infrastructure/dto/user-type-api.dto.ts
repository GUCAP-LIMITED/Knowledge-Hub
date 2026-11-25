import { z } from 'zod';

/**
 * Wire contract for the `/api/app/user-type` endpoints. Every response is validated with Zod at the
 * boundary so malformed payloads are caught here — the domain only sees data it expects.
 */
export const UserTypeRoleDtoSchema = z.object({
  roleId: z.string(),
  roleName: z.string().nullable(),
});

export const UserTypeDtoSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().nullable().optional(),
  name: z.string().min(1),
  normalizedName: z.string().optional(),
  description: z.string().nullable(),
  canLogin: z.boolean(),
  isAdmin: z.boolean(),
  displayOrder: z.number(),
  hierarchyLevel: z.number(),
  dataAccessScope: z.number(),
  isDefault: z.boolean(),
  refId: z.string().nullable(),
  creationTime: z.string(),
  roles: z.array(UserTypeRoleDtoSchema),
});

/** `GET /api/app/user-type` returns a `{ totalCount, items }` envelope. */
export const UserTypeListDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(UserTypeDtoSchema),
});

export const SelectableUserTypeDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  canLogin: z.boolean(),
  hierarchyLevel: z.number(),
  isDefault: z.boolean(),
});

/** `GET /api/app/user-type/selectable` returns ABP's `PagedResultDto`. */
export const SelectableListDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(SelectableUserTypeDtoSchema),
});

export type UserTypeDto = z.infer<typeof UserTypeDtoSchema>;
export type SelectableUserTypeDto = z.infer<typeof SelectableUserTypeDtoSchema>;

export interface UserTypeHierarchyNodeDto {
  userTypeId: string;
  userTypeName: string;
  hierarchyLevel: number;
  canLogin: boolean;
  isDefault?: boolean | undefined;
  reportsTo?: string | null | undefined;
  reports: UserTypeHierarchyNodeDto[];
}

export const UserTypeHierarchyNodeDtoSchema: z.ZodType<UserTypeHierarchyNodeDto> = z.lazy(
  () =>
    z.object({
      userTypeId: z.string().min(1),
      userTypeName: z.string().min(1),
      hierarchyLevel: z.number(),
      canLogin: z.boolean(),
      isDefault: z.boolean().optional(),
      reportsTo: z.string().nullable().optional(),
      reports: z.array(UserTypeHierarchyNodeDtoSchema),
    }),
);

export const UserTypeHierarchyListDtoSchema = z.array(UserTypeHierarchyNodeDtoSchema);
