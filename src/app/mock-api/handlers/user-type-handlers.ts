import { normalizeQuery, notFound, paginate } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import type { MockUserType } from '../seed/org-seed';

const BASE = '/api/app/user-type';

const find = (state: MockState, id: string): MockUserType => {
  const type = state.userTypes.find((t) => t.id === id);
  if (type === undefined) {
    throw notFound('User type');
  }
  return type;
};

const toDto = (type: MockUserType): Record<string, unknown> => ({
  ...type,
  tenantId: null,
  normalizedName: type.name.toUpperCase(),
  refId: null,
  roles: [],
});

interface HierarchyNode {
  userTypeId: string;
  userTypeName: string;
  hierarchyLevel: number;
  canLogin: boolean;
  isDefault: boolean;
  reportsTo: string | null;
  reports: HierarchyNode[];
}

/** A linear reporting chain ordered by hierarchy level (highest authority first). */
const hierarchy = (state: MockState, canLogin: boolean | undefined): HierarchyNode[] => {
  const ordered = [...state.userTypes]
    .filter((t) => canLogin === undefined || t.canLogin === canLogin)
    .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
  // Fold from the lowest level up so each node already owns its reports when its parent is built.
  const chain = ordered.reduceRight<HierarchyNode | null>(
    (child, t, index) => ({
      userTypeId: t.id,
      userTypeName: t.name,
      hierarchyLevel: t.hierarchyLevel,
      canLogin: t.canLogin,
      isDefault: t.isDefault,
      reportsTo: ordered[index - 1]?.id ?? null,
      reports: child === null ? [] : [child],
    }),
    null,
  );
  return chain === null ? [] : [chain];
};

const assertNameFree = (state: MockState, name: string, ignoreId?: string): void => {
  if (
    state.userTypes.some(
      (t) => t.id !== ignoreId && t.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new MockHttpFailure(400, `A user type named "${name}" already exists.`);
  }
};

const create = (state: MockState, request: MockRequest): unknown => {
  const body = request.body as Partial<MockUserType> & { name: string };
  assertNameFree(state, body.name);
  const type: MockUserType = {
    id: nextId(state, 'ut'),
    name: body.name,
    description: body.description ?? null,
    canLogin: body.canLogin ?? true,
    isAdmin: body.isAdmin ?? false,
    displayOrder: body.displayOrder ?? state.userTypes.length,
    hierarchyLevel: body.hierarchyLevel ?? 20,
    dataAccessScope: body.dataAccessScope ?? 0,
    isDefault: false,
    creationTime: state.now.toISOString(),
  };
  state.userTypes.push(type);
  return toDto(type);
};

const update = (state: MockState, request: MockRequest): unknown => {
  const type = find(state, request.params.id ?? '');
  const body = request.body as Partial<MockUserType> & { name: string };
  assertNameFree(state, body.name, type.id);
  if (type.isDefault) {
    throw new MockHttpFailure(400, 'System user types cannot be edited.');
  }
  Object.assign(type, {
    name: body.name,
    description: body.description ?? null,
    canLogin: body.canLogin ?? type.canLogin,
    displayOrder: body.displayOrder ?? type.displayOrder,
    dataAccessScope: body.dataAccessScope ?? type.dataAccessScope,
  });
  return toDto(type);
};

export const userTypeHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: BASE,
    handler: ({ query }) => {
      const page = paginate(state.userTypes.map(toDto), normalizeQuery(query));
      return page;
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/hierarchy`,
    handler: ({ query }) =>
      hierarchy(
        state,
        query.canLogin === undefined ? undefined : query.canLogin === 'true',
      ),
  },
  {
    method: 'GET',
    pattern: `${BASE}/selectable`,
    handler: ({ query }) => {
      const assignable = query.assignableOnly === 'true';
      const items = state.userTypes
        .filter((t) => !assignable || t.canLogin)
        .map((t) => ({
          id: t.id,
          name: t.name,
          canLogin: t.canLogin,
          hierarchyLevel: t.hierarchyLevel,
          isDefault: t.isDefault,
        }));
      return paginate(items, normalizeQuery(query));
    },
  },
  { method: 'POST', pattern: BASE, handler: (r) => create(state, r) },
  { method: 'PUT', pattern: `${BASE}/:id`, handler: (r) => update(state, r) },
  {
    method: 'PUT',
    pattern: `${BASE}/:id/hierarchy-level`,
    handler: (request) => {
      const type = find(state, request.params.id ?? '');
      type.hierarchyLevel = (request.body as { hierarchyLevel: number }).hierarchyLevel;
      return toDto(type);
    },
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const type = find(state, request.params.id ?? '');
      if (type.isDefault) {
        throw new MockHttpFailure(400, 'System user types cannot be deleted.');
      }
      if (state.directory.some((u) => u.userTypeId === type.id)) {
        throw new MockHttpFailure(
          400,
          'Reassign the users of this type before deleting it.',
        );
      }
      state.userTypes.splice(state.userTypes.indexOf(type), 1);
      return null;
    },
  },
];
