import { normalizeQuery, notFound, paginate, requireUser } from '../mock-context';
import type { MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import type { DirectoryUser } from '../seed/directory-seed';
import { BRANCHES } from '../seed/org-seed';
import type { MockUser } from '../seed/mock-users';

const userTypeName = (state: MockState, id: string): string =>
  state.userTypes.find((t) => t.id === id)?.name ?? id;

const toBranchUser = (
  state: MockState,
  user: DirectoryUser,
): Record<string, unknown> => ({
  userId: user.id,
  userName: user.email,
  name: user.name,
  email: user.email,
  isActive: user.isActive,
  userTypes: [
    { userTypeId: user.userTypeId, userTypeName: userTypeName(state, user.userTypeId) },
  ],
  branches: user.branchIds.map((branchId, index) => ({
    branchId,
    branchName: BRANCHES.find((b) => b.id === branchId)?.name ?? null,
    isPrimary: index === 0,
  })),
  profileImageUrl: null,
});

const visibleBranches = (viewer: MockUser): typeof BRANCHES =>
  BRANCHES.filter((b) => viewer.isGlobal || viewer.branchIds.includes(b.id));

const listUsers = (state: MockState, request: MockRequest): unknown => {
  const viewer = requireUser(request);
  const query = normalizeQuery(request.query);
  const branches = visibleBranches(viewer).map((b) => b.id);
  const matches = state.directory.filter(
    (u) =>
      (viewer.isGlobal || u.branchIds.some((b) => branches.includes(b))) &&
      (query.branchid === undefined || u.branchIds.includes(query.branchid)) &&
      (query.usertypeid === undefined || u.userTypeId === query.usertypeid),
  );
  const page = paginate(matches, query);
  return {
    totalCount: page.totalCount,
    items: page.items.map((u) => toBranchUser(state, u)),
  };
};

const setActive = (state: MockState, request: MockRequest, active: boolean): unknown => {
  const user = state.directory.find((u) => u.id === request.params.id);
  if (user === undefined) {
    throw notFound('User');
  }
  if (user.id === requireUser(request).id) {
    throw new MockHttpFailure(400, 'You cannot block your own account.');
  }
  user.isActive = active;
  return null;
};

export const directoryHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/branch/users',
    handler: (r) => listUsers(state, r),
  },
  {
    method: 'GET',
    pattern: '/api/app/branch/my',
    handler: (request) => {
      const items = visibleBranches(requireUser(request));
      return { totalCount: items.length, items };
    },
  },
  {
    method: 'POST',
    pattern: '/api/app/user/:id/block',
    handler: (r) => setActive(state, r, false),
  },
  {
    method: 'POST',
    pattern: '/api/app/user/:id/unblock',
    handler: (r) => setActive(state, r, true),
  },
  {
    method: 'GET',
    pattern: '/api/app/platform-settings',
    handler: () => state.platformSettings,
  },
  {
    method: 'PUT',
    pattern: '/api/app/platform-settings',
    handler: (request) => {
      Object.assign(state.platformSettings, request.body);
      return state.platformSettings;
    },
  },
];
