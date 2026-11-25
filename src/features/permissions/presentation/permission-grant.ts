import type { PermissionMap } from '../domain';

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[-_.]/g, '');

/**
 * Whether `required` is granted in the flat permission map. Tries an exact key first, then a
 * case/separator-insensitive match so `Courses.View` and `courses_view` are treated alike.
 */
export const hasPermissionGrant = (
  permissions: PermissionMap | undefined,
  required: string,
): boolean => {
  if (!permissions) return false;
  if (permissions[required] ?? false) return true;
  const target = normalizeKey(required);
  return Object.entries(permissions).some(
    ([key, value]) => value && normalizeKey(key) === target,
  );
};
