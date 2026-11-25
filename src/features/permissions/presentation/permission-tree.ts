import type { PermissionModule } from '../domain';

/** Flatten the module tree into a flat list (parents before their children). */
export function flattenModules(
  modules: readonly PermissionModule[],
): readonly PermissionModule[] {
  return modules.flatMap((module) => [module, ...flattenModules(module.children)]);
}

/** Seed an editable grant map from a set's module tree. */
export function toGrantMap(
  modules: readonly PermissionModule[],
): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const module of flattenModules(modules)) {
    for (const [name, granted] of Object.entries(module.permissions)) {
      map[name] = granted;
    }
  }
  return map;
}

/**
 * Resolves the flat list of editable modules for permission configuration.
 * Filters out modules without permissions.
 */
export function getEditableModules(
  modules: readonly PermissionModule[],
): readonly PermissionModule[] {
  return flattenModules(modules).filter(
    (module) => Object.keys(module.permissions).length > 0,
  );
}

/** Check if any grant values differ between initial and current maps. */
export function hasPermissionChanges(
  initial: Record<string, boolean>,
  current: Record<string, boolean>,
): boolean {
  const initialKeys = Object.keys(initial);
  const currentKeys = Object.keys(current);
  if (initialKeys.length !== currentKeys.length) {
    return true;
  }
  return initialKeys.some((key) => initial[key] !== current[key]);
}
