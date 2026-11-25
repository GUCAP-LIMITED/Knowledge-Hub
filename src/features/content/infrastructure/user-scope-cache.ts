import { z } from 'zod';
import type { UserScopeData } from '../domain';

const CACHE_PREFIX = 'uapp_user_scope_data';
const TTL_MS = 5 * 60 * 1000; // 5 minutes

const branchOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const teamOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  isActive: z.boolean().optional(),
});

export const userScopeDataSchema = z.object({
  branches: z.array(branchOptionSchema),
  teams: z.array(teamOptionSchema),
});

const cachedEnvelopeSchema = z.object({
  data: userScopeDataSchema,
  timestamp: z.number(),
});

export interface CachedEnvelope {
  readonly data: UserScopeData;
  readonly timestamp: number;
}

const resolveKey = (userId?: string): string =>
  userId ? `${CACHE_PREFIX}_${userId}` : CACHE_PREFIX;

const parseEnvelope = (raw: string): CachedEnvelope | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = cachedEnvelopeSchema.safeParse(parsed);
    if (!result.success) {
      return null;
    }
    return {
      data: {
        branches: result.data.data.branches,
        teams: result.data.data.teams,
      },
      timestamp: result.data.timestamp,
    };
  } catch {
    return null;
  }
};

/**
 * Retrieves cached user scope data (branches and teams) from localStorage if present,
 * valid in structure, and within the 5-minute time-to-live window.
 */
export function getCachedUserScope(userId?: string): UserScopeData | null {
  const key = resolveKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const envelope = parseEnvelope(raw);
    if (!envelope) {
      localStorage.removeItem(key);
      return null;
    }

    if (Date.now() - envelope.timestamp > TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return envelope.data;
  } catch {
    return null;
  }
}

/**
 * Saves user scope data with current timestamp to localStorage.
 */
export function setCachedUserScope(data: UserScopeData, userId?: string): void {
  try {
    const envelope: CachedEnvelope = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(resolveKey(userId), JSON.stringify(envelope));
  } catch {
    // Silently ignore storage quota or private mode failures
  }
}

/**
 * Clears cached user scope data from localStorage. If a userId is given, removes that
 * user's cache; otherwise removes the default cache and any user-keyed scope caches.
 */
export function clearCachedUserScope(userId?: string): void {
  try {
    if (userId) {
      localStorage.removeItem(resolveKey(userId));
      return;
    }

    localStorage.removeItem(CACHE_PREFIX);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}
