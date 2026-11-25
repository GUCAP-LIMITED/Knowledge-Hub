import { buildRoutePermissionLookup } from './route-permission-lookup';
import { hasPermissionGrant } from './permission-grant';
import { useMyPermissionModules, useMyPermissions } from './use-permissions';

/**
 * Whether the signed-in user may open the route registered under `path` (e.g. `/courses`), using
 * the same sidebar `basePermission` data as the `RequirePermission` route guard. Returns `false`
 * while permissions are loading or when the route has no permission mapping, so callers hide
 * links rather than offering one that would bounce to `/forbidden`.
 */
export const useCanAccessRoute = (path: string): boolean => {
  const { data: groups } = useMyPermissionModules();
  const { data: permissions } = useMyPermissions();
  const required = buildRoutePermissionLookup(groups ?? [], [path]).get(path);
  return required !== undefined && hasPermissionGrant(permissions, required);
};
