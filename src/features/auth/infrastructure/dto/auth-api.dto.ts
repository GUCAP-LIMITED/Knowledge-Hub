import { z } from 'zod';

/**
 * Wire contract for the login/refresh endpoints. We validate every response at the boundary with
 * Zod so malformed/unexpected payloads are caught here — the domain only ever sees data that
 * already matches its expectations. The server returns the user object directly; the client does
 * not decode the access token.
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().min(1).optional().default('Bearer'),
  expiresIn: z.number().int().positive(),
  refreshToken: z.string().min(1).nullable().optional(),
  user: z.object({
    id: z.string().min(1),
    email: z.string().min(1),
    fullName: z.string().optional(),
    roles: z.array(z.string()).default([]),
    userType: z.string().nullable().optional(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
