import { z } from 'zod';

/**
 * Wire contract for the `/api/app/user-hierarchy` endpoints. Every response is validated with Zod at
 * the boundary so malformed payloads are caught here.
 */
export interface HierarchyNodeDto {
  readonly userId: string;
  readonly userName: string | null;
  readonly email: string | null;
  readonly profileImageUrl: string | null;
  readonly userTypeId: string;
  readonly userTypeName: string;
  readonly hierarchyLevel: number;
  readonly reports: readonly HierarchyNodeDto[];
}

export const HierarchyNodeDtoSchema: z.ZodType<HierarchyNodeDto> = z.lazy(() =>
  z.object({
    userId: z.string(),
    userName: z.string().nullable(),
    email: z.string().nullable(),
    profileImageUrl: z.string().nullable(),
    userTypeId: z.string(),
    userTypeName: z.string(),
    hierarchyLevel: z.number(),
    reports: z.array(HierarchyNodeDtoSchema),
  }),
);

export const HierarchyTreeDtoSchema = z.array(HierarchyNodeDtoSchema);

export const HierarchyEdgeDtoSchema = z.object({
  subordinateId: z.string(),
  subordinateUserTypeId: z.string(),
  managerId: z.string(),
  managerUserTypeId: z.string(),
  branchId: z.string(),
  source: z.number(),
});

export const HierarchyEdgeListDtoSchema = z.array(HierarchyEdgeDtoSchema);

export type HierarchyEdgeDto = z.infer<typeof HierarchyEdgeDtoSchema>;
