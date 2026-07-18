import { z } from 'zod';

export const TeamMemberDtoSchema = z.object({
  userTypeId: z.string(),
  userTypeName: z.string().nullable(),
});

export const TeamDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  members: z.array(TeamMemberDtoSchema),
});

export const TeamListDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(TeamDtoSchema),
});

export const TeamUserTypeOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type TeamDto = z.infer<typeof TeamDtoSchema>;
export type TeamUserTypeOptionDto = z.infer<typeof TeamUserTypeOptionSchema>;
