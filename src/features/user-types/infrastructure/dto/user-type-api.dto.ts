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
  isActive: z.boolean(),
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
  isActive: z.boolean(),
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
