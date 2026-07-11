import { useMemo } from 'react';
import { useAuth } from '@features/auth';
import type { UserRole } from '../domain';
import type { CapId } from './permission-catalog';
import { baseSetFor, effectiveValue, emptyUserPermission } from './permission-sets';
import { usePermissionSets } from './use-permission-sets';

// Highest-privilege role wins when a user somehow holds more than one.
const ROLE_RANK: readonly UserRole[] = ['admin', 'manager', 'consultant'];

const primaryRole = (roleNames: readonly string[]): UserRole =>
  ROLE_RANK.find((role) => roleNames.includes(role)) ?? 'consultant';

export interface MyCapabilities {
  /** True when the signed-in user may perform `cap` on `moduleId`, per their resolved permissions. */
  readonly can: (moduleId: string, cap: CapId) => boolean;
  readonly role: UserRole;
}

/**
 * Resolves the signed-in user's effective capabilities from their role's default permission set
 * plus any per-user overrides — the single source of truth for capability-gated UI and routes.
 */
export const useMyCapabilities = (): MyCapabilities => {
  const { user } = useAuth();
  const sets = usePermissionSets((state) => state.sets);
  const userPerms = usePermissionSets((state) => state.userPerms);

  return useMemo<MyCapabilities>(() => {
    const role = primaryRole(user?.roleNames ?? []);
    const permission =
      (user === null ? undefined : userPerms[user.id]) ?? emptyUserPermission();
    const base = baseSetFor(sets, role, permission.setId);
    return {
      role,
      can: (moduleId: string, cap: CapId): boolean =>
        effectiveValue(base, permission.overrides, moduleId, cap),
    };
  }, [user, sets, userPerms]);
};
