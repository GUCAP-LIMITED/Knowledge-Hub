import { z } from 'zod';

const BranchAssignmentDtoSchema = z.object({
  branchId: z.string(),
  // Nullable on the wire (`BranchAssignmentInfo.BranchName` is `string?`); coalesced in the mapper.
  branchName: z.string().nullable(),
  isPrimary: z.boolean(),
});

const BranchUserTypeDtoSchema = z.object({
  userTypeId: z.string(),
  userTypeName: z.string(),
});

export const BranchUserDtoSchema = z.object({
  userId: z.string(),
  userName: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  isActive: z.boolean(),
  userTypes: z.array(BranchUserTypeDtoSchema),
  branches: z.array(BranchAssignmentDtoSchema),
  profileImageUrl: z.string().nullable(),
});

export const BranchUserListDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(BranchUserDtoSchema),
});

/** `GET /api/app/branch` returns richer rows; we only need id + name for the filter. */
export const BranchListItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const BranchListDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(BranchListItemDtoSchema),
});

export type BranchUserDto = z.infer<typeof BranchUserDtoSchema>;
export type BranchListItemDto = z.infer<typeof BranchListItemDtoSchema>;
