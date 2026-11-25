import type { MockState } from './mock-state';
import { MockHttpFailure, type MockRequest } from './mock-types';
import { findMockUser, type MockUser } from './seed/mock-users';

/** The signed-in demo user, or a 401 (which the real client would answer the same way). */
export const requireUser = (request: MockRequest): MockUser => {
  const user = findMockUser(request.userId);
  if (user === undefined) {
    throw new MockHttpFailure(401, 'Unauthorized');
  }
  return user;
};

/** Permission keys granted to a user via their user type's default permission set. */
export const grantsOf = (state: MockState, user: MockUser): ReadonlySet<string> => {
  const setId = state.typeDefaults.get(user.userTypeId);
  return (
    state.permissionSets.find((set) => set.id === setId)?.grants ?? new Set<string>()
  );
};

export const can = (state: MockState, user: MockUser, permission: string): boolean =>
  grantsOf(state, user).has(permission);

export const notFound = (what: string): MockHttpFailure =>
  new MockHttpFailure(404, `${what} not found`);

/** Applies `skipCount` / `maxResultCount` from the query string. */
export const paginate = <T>(
  items: readonly T[],
  query: Readonly<Record<string, string>>,
): { items: T[]; totalCount: number } => {
  const skip = Number(query.skipCount ?? 0);
  const take = Number(query.maxResultCount ?? items.length);
  return {
    items: items.slice(skip, skip + (Number.isFinite(take) ? take : items.length)),
    totalCount: items.length,
  };
};

/** Sorts by an ABP-style `sorting` string such as `title asc` or `creationTime desc`. */
export const sortBy = <T>(
  items: readonly T[],
  sorting: string | undefined,
  accessors: Readonly<Record<string, (item: T) => string | number>>,
): T[] => {
  const [field, direction] = (sorting ?? '').trim().split(/\s+/);
  const accessor = field === undefined ? undefined : accessors[field.toLowerCase()];
  if (accessor === undefined) {
    return [...items];
  }
  const sign = direction?.toLowerCase() === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * sign;
    }
    return String(left).localeCompare(String(right)) * sign;
  });
};
