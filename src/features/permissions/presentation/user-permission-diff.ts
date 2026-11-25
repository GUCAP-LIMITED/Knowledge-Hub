import type { UserEffectivePermissions } from '../domain';
import { toGrantMap } from './permission-tree';

/** The two writes needed to persist an admin's desired effective state for one user. */
export interface UserPermissionWrites {
  /** Direct-grant changes to PUT: `true` adds a "U" grant, `false` removes one. */
  readonly grantDiff: Record<string, boolean>;
  /** The full replacement deny set = existing − turned-on/reset + turned-off. */
  readonly newDenies: readonly string[];
  readonly grantChanged: boolean;
  readonly deniesChanged: boolean;
}

/**
 * Diff the admin's desired effective state (`desired`) against the loaded state and derive the two
 * writes the backend needs.
 *
 * - **Reset caps** (`resetCaps`) revert to the pure role value: drop the user's direct grant and lift
 *   any deny. They take precedence over `desired` and are never processed as toggles.
 * - A permission turned **on** is granted directly and lifted out of the deny set; one turned **off**
 *   is denied (role membership isn't fully observable, so a deny is the only guaranteed way to force
 *   it false) and its direct grant removed.
 * - Unchanged permissions are left exactly as they were, preserving role-inherited grants and denies.
 */
export const buildUserPermissionWrites = (
  data: UserEffectivePermissions,
  desired: Record<string, boolean>,
  resetCaps: ReadonlySet<string> = new Set(),
): UserPermissionWrites => {
  const initial = toGrantMap(data.permissionModules);
  const directSet = new Set(data.directGrantedPermissions);
  const denies = new Set(data.deniedPermissions);
  const grantDiff: Record<string, boolean> = {};
  let deniesChanged = false;

  // 1) Resets — revert each cap to its pure role value (drop direct grant + any deny).
  for (const name of resetCaps) {
    if (directSet.has(name)) {
      grantDiff[name] = false;
    }
    if (denies.delete(name)) {
      deniesChanged = true;
    }
  }

  // 2) Toggles — for caps not being reset, diff desired vs the loaded effective value.
  for (const [name, want] of Object.entries(desired)) {
    if (resetCaps.has(name) || want === (initial[name] === true)) {
      continue;
    }
    grantDiff[name] = want;
    if (want) {
      if (denies.delete(name)) {
        deniesChanged = true;
      }
    } else if (!denies.has(name)) {
      denies.add(name);
      deniesChanged = true;
    }
  }

  return {
    grantDiff,
    newDenies: [...denies],
    grantChanged: Object.keys(grantDiff).length > 0,
    deniesChanged,
  };
};
