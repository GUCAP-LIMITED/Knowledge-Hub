import { z } from 'zod';

/**
 * Wire contract for the OpenIddict token endpoint (OAuth snake_case). Identity is NOT in this body —
 * it is decoded from the JWT (`decode-jwt.ts`); permissions/user-types are loaded by their own slices.
 */
export const AcademyTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().min(1).optional().default('Bearer'),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1).nullable().optional(),
  scope: z.string().optional(),
});
export type AcademyTokenResponse = z.infer<typeof AcademyTokenResponseSchema>;
