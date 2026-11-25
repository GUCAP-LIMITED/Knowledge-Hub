import { matchPath } from 'react-router-dom';
import type { SidebarGroup, SidebarModule } from '../domain';

const flattenModules = (modules: readonly SidebarModule[]): readonly SidebarModule[] =>
  modules.flatMap((module) => [module, ...flattenModules(module.children)]);

const flattenGroups = (groups: readonly SidebarGroup[]): readonly SidebarModule[] =>
  groups.flatMap((group) => flattenModules(group.items));

/**
 * Maps each given route pattern (e.g. `/courses/:id`) to the `basePermission` of the sidebar module
 * whose (always-static) `href` is a matching ancestor of it (e.g. `/courses` → `Courses.View`).
 * Matching treats each sidebar `href` as the matcher and the route pattern as the candidate path —
 * the reverse would fail to match a required param segment (`/courses/:id` has no literal "/courses"
 * pathname to test). When several hrefs match, the longest (most specific) one wins.
 */
export const buildRoutePermissionLookup = (
  groups: readonly SidebarGroup[],
  routePatterns: readonly string[],
): ReadonlyMap<string, string> => {
  const modules = flattenGroups(groups);
  const lookup = new Map<string, string>();

  for (const pattern of routePatterns) {
    const candidates = modules.filter(
      (module) =>
        matchPath({ path: module.href, end: module.href === '/' }, pattern) !== null,
    );
    const best = candidates.reduce<SidebarModule | undefined>(
      (longest, candidate) =>
        longest === undefined || candidate.href.length > longest.href.length
          ? candidate
          : longest,
      undefined,
    );
    if (best !== undefined) {
      lookup.set(pattern, best.basePermission);
    }
  }

  return lookup;
};
