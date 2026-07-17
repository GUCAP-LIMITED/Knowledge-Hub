import { useMemo } from 'react';
import { useAuth } from '@features/auth';
import { useMyPermissions } from '@features/permissions';
import type { UserRole } from '../domain';
import type { CapId } from './permission-catalog';
import { toPermissionName } from './capability-permission-map';

// Highest-privilege role wins when a user somehow holds more than one.
const ROLE_RANK: readonly UserRole[] = ['admin', 'manager', 'consultant'];

const primaryRole = (roleNames: readonly string[]): UserRole =>
  ROLE_RANK.find((role) => roleNames.includes(role)) ?? 'consultant';

export interface MyCapabilities {
  /** True when the signed-in user may perform `cap` on `moduleId`, per their effective permissions. */
  readonly can: (moduleId: string, cap: CapId) => boolean;
  readonly role: UserRole;
  /** True while the effective-permission map is still loading — guards should wait, not decide. */
  readonly isLoading: boolean;
}

/**
 * Resolves the signed-in user's effective capabilities from the API-backed permission map
 * (`GET /api/app/my/permissions`) — the single source of truth for capability-gated UI and routes.
 * Client `(module, cap)` pairs are translated to backend dot-notation keys via {@link toPermissionName}.
 */
export const useMyCapabilities = (): MyCapabilities => {
  const { user } = useAuth();
  const { data, isPending } = useMyPermissions();

  return useMemo<MyCapabilities>(() => {
    const role = primaryRole(user?.roleNames ?? []);
    return {
      role,
      isLoading: isPending,
      can: (moduleId: string, cap: CapId): boolean =>
        data?.[toPermissionName(moduleId, cap)] === true,
    };
  }, [user, data, isPending]);
};
