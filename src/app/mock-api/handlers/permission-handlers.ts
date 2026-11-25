import type { MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import { findMockUser } from '../seed/mock-users';
import {
  GROUP_LABELS,
  PERMISSION_CATALOG,
  type CatalogModule,
} from '../seed/permission-catalog';
import type { MockPermissionSet } from '../seed/permission-sets';

const setFor = (state: MockState, userTypeId: string): MockPermissionSet | undefined => {
  const setId = state.typeDefaults.get(userTypeId);
  return state.permissionSets.find((set) => set.id === setId);
};

const grantsFor = (state: MockState, request: MockRequest): ReadonlySet<string> => {
  const user = findMockUser(request.userId);
  if (user === undefined) {
    throw new MockHttpFailure(401, 'Unauthorized');
  }
  return setFor(state, user.userTypeId)?.grants ?? new Set<string>();
};

const toNavItem = (
  module: CatalogModule,
  grants: ReadonlySet<string>,
): Record<string, unknown> | null => {
  const children = (module.children ?? [])
    .map((child) => toNavItem(child, grants))
    .filter((child): child is Record<string, unknown> => child !== null);
  if (!grants.has(module.basePermission)) {
    return null;
  }
  return {
    id: module.id,
    name: module.name,
    icon: module.icon,
    sidebarMenu: module.sidebarMenu,
    description: module.description,
    basePermission: module.basePermission,
    href: module.href,
    count: null,
    children,
  };
};

const toDetailModule = (
  module: CatalogModule,
  grants: ReadonlySet<string>,
): Record<string, unknown> => ({
  moduleId: module.id,
  moduleName: module.name,
  icon: module.icon,
  href: module.href,
  basePermission: module.basePermission,
  isEnabled: grants.has(module.basePermission),
  permissions: Object.fromEntries(module.actions.map((a) => [a, grants.has(a)])),
  children: (module.children ?? []).map((child) => toDetailModule(child, grants)),
});

const toSummary = (set: MockPermissionSet): Record<string, unknown> => ({
  id: set.id,
  name: set.name,
  description: set.description,
  color: set.color,
  bgColor: set.bgColor,
  isSystemDefault: set.isSystemDefault,
  enabledCount: set.grants.size,
  totalCount: 0,
});

const navGroups = (grants: ReadonlySet<string>): unknown[] =>
  (Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[])
    .map((group) => ({
      id: group,
      label: GROUP_LABELS[group],
      items: PERMISSION_CATALOG.filter((m) => m.group === group)
        .map((m) => toNavItem(m, grants))
        .filter((item) => item !== null),
    }))
    .filter((group) => group.items.length > 0);

export const permissionHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/my/permissions',
    handler: (request) =>
      Object.fromEntries([...grantsFor(state, request)].map((key) => [key, true])),
  },
  {
    method: 'GET',
    pattern: '/api/app/my/permission-modules',
    handler: (request) => navGroups(grantsFor(state, request)),
  },
  {
    method: 'GET',
    pattern: '/api/app/permission-sets',
    handler: () => state.permissionSets.map(toSummary),
  },
  {
    method: 'GET',
    pattern: '/api/app/permission-sets/:id',
    handler: ({ params }) => {
      const set = state.permissionSets.find((s) => s.id === params.id);
      if (set === undefined) {
        throw new MockHttpFailure(404, 'Permission set not found');
      }
      return {
        ...toSummary(set),
        permissionModules: PERMISSION_CATALOG.map((m) => toDetailModule(m, set.grants)),
      };
    },
  },
];
