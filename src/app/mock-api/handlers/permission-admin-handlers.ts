import { notFound, patch } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRoute } from '../mock-types';
import { PERMISSION_CATALOG, allPermissionKeys } from '../seed/permission-catalog';
import type { MockPermissionSet } from '../seed/permission-sets';
import type { DirectoryUser } from '../seed/directory-seed';
import { toDetailModule, toSummary } from './permission-handlers';

interface SetInput {
  readonly name: string;
  readonly description: string | null;
  readonly color: string | null;
  readonly bgColor: string | null;
  readonly permissions: Record<string, boolean>;
}

const grantedKeys = (permissions: Record<string, boolean>): Set<string> =>
  new Set(
    Object.entries(permissions)
      .filter(([, on]) => on)
      .map(([key]) => key),
  );

const findSet = (state: MockState, id: string): MockPermissionSet => {
  const set = state.permissionSets.find((s) => s.id === id);
  if (set === undefined) {
    throw notFound('Permission set');
  }
  return set;
};

const detail = (set: MockPermissionSet): Record<string, unknown> => ({
  ...toSummary(set),
  permissionModules: PERMISSION_CATALOG.map((m) => toDetailModule(m, set.grants)),
});

const findUser = (state: MockState, id: string): DirectoryUser => {
  const user = state.directory.find((u) => u.id === id);
  if (user === undefined) {
    throw notFound('User');
  }
  return user;
};

const effective = (state: MockState, user: DirectoryUser): Set<string> => {
  const setId = user.permissionSetId ?? state.typeDefaults.get(user.userTypeId);
  const keys = new Set(state.permissionSets.find((s) => s.id === setId)?.grants ?? []);
  user.grants.forEach((k) => keys.add(k));
  user.denies.forEach((k) => keys.delete(k));
  return keys;
};

const diff = (
  before: ReadonlySet<string>,
  after: ReadonlySet<string>,
): Record<string, unknown> => {
  const added = [...after].filter((k) => !before.has(k));
  const removed = [...before].filter((k) => !after.has(k));
  return { added, removed, changedCount: added.length + removed.length };
};

const setRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'POST',
    pattern: '/api/app/permission-sets',
    handler: ({ body }) => {
      const input = body as SetInput;
      if (
        state.permissionSets.some(
          (s) => s.name.toLowerCase() === input.name.toLowerCase(),
        )
      ) {
        throw new MockHttpFailure(
          400,
          `A permission set named "${input.name}" already exists.`,
        );
      }
      const set: MockPermissionSet = {
        id: nextId(state, 'pset'),
        name: input.name,
        description: input.description ?? '',
        color: input.color ?? '#475569',
        bgColor: input.bgColor ?? '#E2E8F0',
        isSystemDefault: false,
        grants: grantedKeys(input.permissions),
      };
      state.permissionSets.push(set);
      return detail(set);
    },
  },
  {
    method: 'PUT',
    pattern: '/api/app/permission-sets/:id',
    handler: ({ params, body }) => {
      const set = findSet(state, params.id ?? '');
      const input = body as SetInput;
      Object.assign(set, {
        name: input.name,
        description: input.description ?? '',
        color: input.color ?? set.color,
        bgColor: input.bgColor ?? set.bgColor,
        grants: grantedKeys(input.permissions),
      });
      return detail(set);
    },
  },
  {
    method: 'DELETE',
    pattern: '/api/app/permission-sets/:id',
    handler: ({ params }) => {
      const set = findSet(state, params.id ?? '');
      if (set.isSystemDefault) {
        throw new MockHttpFailure(400, 'System permission sets cannot be deleted.');
      }
      if ([...state.typeDefaults.values()].includes(set.id)) {
        throw new MockHttpFailure(
          400,
          'This set is the default for a user type. Reassign it first.',
        );
      }
      state.permissionSets.splice(state.permissionSets.indexOf(set), 1);
      return null;
    },
  },
];

const defaultRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/user-types/permission-defaults',
    handler: () =>
      state.userTypes.map((type) => {
        const setId = state.typeDefaults.get(type.id);
        return {
          userTypeId: type.id,
          userTypeName: type.name,
          permissionSetRoleId: setId ?? null,
          permissionSetName:
            state.permissionSets.find((s) => s.id === setId)?.name ?? null,
          userCount: state.directory.filter((u) => u.userTypeId === type.id).length,
        };
      }),
  },
  {
    method: 'PUT',
    pattern: '/api/app/user-types/:id/permission-default',
    handler: ({ params, body }) => {
      const input = body as {
        permissionSetRoleId: string;
        applyToExistingUsers: boolean;
      };
      findSet(state, input.permissionSetRoleId);
      state.typeDefaults.set(params.id ?? '', input.permissionSetRoleId);
      if (input.applyToExistingUsers) {
        state.directory
          .filter((u) => u.userTypeId === params.id)
          .forEach((u) => {
            patch(u, { permissionSetId: undefined });
          });
      }
      return null;
    },
  },
];

const userRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/users/:id/permissions',
    handler: ({ params }) => {
      const user = findUser(state, params.id ?? '');
      const keys = effective(state, user);
      return {
        userId: user.id,
        userName: user.name,
        userTypeName: state.userTypes.find((t) => t.id === user.userTypeId)?.name ?? null,
        permissionModules: PERMISSION_CATALOG.map((m) => toDetailModule(m, keys)),
        directGrantedPermissions: [...user.grants],
        deniedPermissions: [...user.denies],
      };
    },
  },
  {
    method: 'PUT',
    pattern: '/api/app/users/:id/permission-set',
    handler: ({ params, body }) => {
      const user = findUser(state, params.id ?? '');
      const setId = (body as { permissionSetRoleId: string | null }).permissionSetRoleId;
      if (setId === null) {
        delete user.permissionSetId;
      } else {
        user.permissionSetId = findSet(state, setId).id;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/api/app/users/:id/permissions',
    handler: ({ params, body }) => {
      const user = findUser(state, params.id ?? '');
      const before = effective(state, user);
      const wanted = grantedKeys(
        (body as { permissions: Record<string, boolean> }).permissions,
      );
      const base = effective(state, { ...user, grants: new Set(), denies: new Set() });
      user.grants.clear();
      wanted.forEach((k) => {
        if (!base.has(k) && allPermissionKeys().includes(k)) user.grants.add(k);
      });
      return diff(before, effective(state, user));
    },
  },
  {
    method: 'PUT',
    pattern: '/api/app/users/:id/permission-denies',
    handler: ({ params, body }) => {
      const user = findUser(state, params.id ?? '');
      const before = effective(state, user);
      user.denies.clear();
      (body as { deniedPermissions: string[] }).deniedPermissions.forEach((k) =>
        user.denies.add(k),
      );
      return diff(before, effective(state, user));
    },
  },
];

export const permissionAdminHandlers = (state: MockState): readonly MockRoute[] => [
  ...setRoutes(state),
  ...defaultRoutes(state),
  ...userRoutes(state),
];
