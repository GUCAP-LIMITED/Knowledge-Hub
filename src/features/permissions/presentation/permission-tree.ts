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
