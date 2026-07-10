import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../domain';
import {
  BASE_CAP,
  type CapId,
  MODULES,
  type PermissionGrid,
  enforceModuleDeps,
} from './permission-catalog';
import {
  type PermissionSet,
  type UserPermission,
  baseSetFor,
  buildDefaultSets,
  diffOverrides,
  effectiveGrid,
  emptyUserPermission,
} from './permission-sets';

const STORAGE_KEY = 'kh.permission-sets.v2';

export interface PermissionSetsState {
  readonly sets: PermissionSet[];
  readonly userPerms: Record<string, UserPermission>;
  // --- Permission-set editing (Permissions page) ---
  readonly toggleSetCap: (setId: string, moduleId: string, cap: CapId) => void;
  readonly setSetModule: (setId: string, moduleId: string, on: boolean) => void;
  readonly resetSet: (setId: string) => void;
  readonly addSet: () => void;
  readonly removeSet: (setId: string) => void;
  readonly renameSet: (setId: string, name: string, description: string) => void;
  // --- Per-user assignment + overrides (Users → Edit Permissions) ---
  readonly assignUserSet: (userId: string, setId: string | null) => void;
  readonly toggleUserCap: (
    userId: string,
    role: UserRole,
    moduleId: string,
    cap: CapId,
  ) => void;
  readonly resetUserCap: (
    userId: string,
    role: UserRole,
    moduleId: string,
    cap: CapId,
  ) => void;
  readonly resetUserAll: (userId: string) => void;
}

const flipInModule = (
  grid: PermissionGrid,
  moduleId: string,
  cap: CapId,
): PermissionGrid => {
  const caps = grid[moduleId] ?? {};
  const next = { ...grid, [moduleId]: { ...caps, [cap]: !(caps[cap] ?? false) } };
  return enforceModuleDeps(next, moduleId);
};

const fillModule = (
  grid: PermissionGrid,
  moduleId: string,
  on: boolean,
): PermissionGrid => {
  const module = MODULES.find((entry) => entry.id === moduleId);
  const caps: Partial<Record<CapId, boolean>> = {};
  for (const cap of module?.capabilities ?? []) {
    caps[cap] = on;
  }
  return enforceModuleDeps({ ...grid, [moduleId]: caps }, moduleId);
};

const mapSet = (
  sets: PermissionSet[],
  setId: string,
  change: (set: PermissionSet) => PermissionSet,
): PermissionSet[] => sets.map((set) => (set.id === setId ? change(set) : set));

const nextCustomId = (sets: readonly PermissionSet[]): string => {
  const used = sets
    .map((set) => Number.parseInt(set.id.replace('custom-', ''), 10))
    .filter((value) => !Number.isNaN(value));
  return `custom-${String(Math.max(0, ...used) + 1)}`;
};

const userPerm = (state: PermissionSetsState, userId: string): UserPermission =>
  state.userPerms[userId] ?? emptyUserPermission();

const writeOverrides = (
  state: PermissionSetsState,
  userId: string,
  role: UserRole,
  build: (base: PermissionSet, current: UserPermission) => PermissionGrid,
): Record<string, UserPermission> => {
  const current = userPerm(state, userId);
  const base = baseSetFor(state.sets, role, current.setId);
  return {
    ...state.userPerms,
    [userId]: { ...current, overrides: build(base, current) },
  };
};

type Mutate = (
  updater: (state: PermissionSetsState) => Partial<PermissionSetsState>,
) => void;

type SetActions = Pick<
  PermissionSetsState,
  'toggleSetCap' | 'setSetModule' | 'resetSet' | 'addSet' | 'removeSet' | 'renameSet'
>;

type UserActions = Pick<
  PermissionSetsState,
  'assignUserSet' | 'toggleUserCap' | 'resetUserCap' | 'resetUserAll'
>;

const buildSetActions = (set: Mutate): SetActions => ({
  toggleSetCap: (setId, moduleId, cap): void => {
    set((s) => ({
      sets: mapSet(s.sets, setId, (item) => ({
        ...item,
        grid: flipInModule(item.grid, moduleId, cap),
      })),
    }));
  },
  setSetModule: (setId, moduleId, on): void => {
    set((s) => ({
      sets: mapSet(s.sets, setId, (item) => ({
        ...item,
        grid: fillModule(item.grid, moduleId, on),
      })),
    }));
  },
  resetSet: (setId): void => {
    const seeded = buildDefaultSets().find((item) => item.id === setId);
    set((s) => ({
      sets: seeded === undefined ? s.sets : mapSet(s.sets, setId, () => seeded),
    }));
  },
  addSet: (): void => {
    set((s) => {
      const basic = buildDefaultSets()[3];
      const created: PermissionSet = {
        id: nextCustomId(s.sets),
        name: 'Custom Access',
        description: 'A custom permission set — rename and tune it below.',
        level: 5,
        grid: basic?.grid ?? {},
        custom: true,
      };
      return { sets: [...s.sets, created] };
    });
  },
  removeSet: (setId): void => {
    set((s) => ({ sets: s.sets.filter((item) => item.id !== setId) }));
  },
  renameSet: (setId, name, description): void => {
    set((s) => ({
      sets: mapSet(s.sets, setId, (item) => ({ ...item, name, description })),
    }));
  },
});

const buildUserActions = (set: Mutate): UserActions => ({
  assignUserSet: (userId, setId): void => {
    set((s) => ({
      userPerms: { ...s.userPerms, [userId]: { setId, overrides: {} } },
    }));
  },
  toggleUserCap: (userId, role, moduleId, cap): void => {
    set((s) => ({
      userPerms: writeOverrides(s, userId, role, (base, current) => {
        const merged = effectiveGrid(base, current.overrides);
        return diffOverrides(base, flipInModule(merged, moduleId, cap));
      }),
    }));
  },
  resetUserCap: (userId, role, moduleId, cap): void => {
    set((s) => ({
      userPerms: writeOverrides(s, userId, role, (base, current) => {
        const merged = effectiveGrid(base, current.overrides);
        const restored = base.grid[moduleId]?.[cap] ?? false;
        const fixed = enforceModuleDeps(
          { ...merged, [moduleId]: { ...merged[moduleId], [cap]: restored } },
          moduleId,
        );
        return diffOverrides(base, fixed);
      }),
    }));
  },
  resetUserAll: (userId): void => {
    set((s) => ({
      userPerms: { ...s.userPerms, [userId]: emptyUserPermission() },
    }));
  },
});

export const usePermissionSets = create<PermissionSetsState>()(
  persist(
    (set) => ({
      sets: buildDefaultSets(),
      userPerms: {},
      ...buildSetActions(set),
      ...buildUserActions(set),
    }),
    { name: STORAGE_KEY },
  ),
);

export { BASE_CAP };
