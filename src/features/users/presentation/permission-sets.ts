import type { UserRole } from '../domain';
import {
  BASE_CAP,
  type CapId,
  MODULES,
  type PermissionGrid,
  buildGridForLevel,
} from './permission-catalog';

/** A named bundle of capabilities that can be assigned to a role or an individual user. */
export interface PermissionSet {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Representative access level (1 = broadest) used only to seed the initial grid. */
  readonly level: number;
  readonly grid: PermissionGrid;
  /** Seeded sets cannot be deleted; user-created ones can. */
  readonly custom: boolean;
}

interface SeedSet {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly level: number;
}

const SEED_SETS: readonly SeedSet[] = [
  {
    id: 'full-access',
    name: 'Full Access',
    description: 'Complete access to every module and setting.',
    level: 1,
  },
  {
    id: 'manager-access',
    name: 'Manager Access',
    description: 'Management level — most actions, no destructive admin.',
    level: 2,
  },
  {
    id: 'team-leader-access',
    name: 'Team Leader Access',
    description: 'Lead a team, assign training, keep an eye on progress.',
    level: 4,
  },
  {
    id: 'basic-access',
    name: 'Basic Access',
    description: 'Learner access — view content and submit work.',
    level: 5,
  },
];

/** Each platform role falls back to one of the seeded sets when no explicit set is chosen. */
export const ROLE_DEFAULT_SET: Record<UserRole, string> = {
  admin: 'full-access',
  manager: 'manager-access',
  consultant: 'basic-access',
};

/** Build the seeded permission sets from the level heuristic. */
export const buildDefaultSets = (): PermissionSet[] =>
  SEED_SETS.map((seed) => ({
    ...seed,
    grid: buildGridForLevel(seed.level),
    custom: false,
  }));

/** Guaranteed non-empty fallback so resolution always returns a set even if the store is empty. */
const FALLBACK_SET: PermissionSet = {
  id: 'full-access',
  name: 'Full Access',
  description: 'Complete access to every module and setting.',
  level: 1,
  grid: buildGridForLevel(1),
  custom: false,
};

export const findSet = (
  sets: readonly PermissionSet[],
  setId: string | null,
): PermissionSet | undefined => sets.find((set) => set.id === setId);

/** The set a user resolves to before their own overrides: explicit assignment or role default. */
export const baseSetFor = (
  sets: readonly PermissionSet[],
  role: UserRole,
  assignedSetId: string | null,
): PermissionSet => {
  const explicit = findSet(sets, assignedSetId);
  const fallback = findSet(sets, ROLE_DEFAULT_SET[role]);
  return explicit ?? fallback ?? sets[0] ?? FALLBACK_SET;
};

/** A single user's permission profile: an optional set assignment plus sparse per-cap overrides. */
export interface UserPermission {
  /** `null` means "use the role default". */
  readonly setId: string | null;
  /** Only the cells that differ from the base set are stored. */
  readonly overrides: PermissionGrid;
}

export const emptyUserPermission = (): UserPermission => ({
  setId: null,
  overrides: {},
});

const gridValue = (grid: PermissionGrid, moduleId: string, cap: CapId): boolean =>
  grid[moduleId]?.[cap] ?? false;

/** Whether the user has overridden a specific capability away from the base set. */
export const hasOverride = (
  overrides: PermissionGrid,
  moduleId: string,
  cap: CapId,
): boolean => overrides[moduleId]?.[cap] !== undefined;

/** The effective (post-override) value of one capability for a user. */
export const effectiveValue = (
  base: PermissionSet,
  overrides: PermissionGrid,
  moduleId: string,
  cap: CapId,
): boolean =>
  hasOverride(overrides, moduleId, cap)
    ? gridValue(overrides, moduleId, cap)
    : gridValue(base.grid, moduleId, cap);

/** Merge a base set with a user's overrides into a single effective grid. */
export const effectiveGrid = (
  base: PermissionSet,
  overrides: PermissionGrid,
): PermissionGrid => {
  const grid: PermissionGrid = {};
  for (const module of MODULES) {
    const caps: Partial<Record<CapId, boolean>> = {};
    for (const cap of module.capabilities) {
      caps[cap] = effectiveValue(base, overrides, module.id, cap);
    }
    grid[module.id] = caps;
  }
  return grid;
};

/** Reduce an effective grid to only the cells that differ from the base set. */
export const diffOverrides = (
  base: PermissionSet,
  effective: PermissionGrid,
): PermissionGrid => {
  const overrides: PermissionGrid = {};
  for (const module of MODULES) {
    const caps: Partial<Record<CapId, boolean>> = {};
    for (const cap of module.capabilities) {
      const value = gridValue(effective, module.id, cap);
      if (value !== gridValue(base.grid, module.id, cap)) {
        caps[cap] = value;
      }
    }
    if (Object.keys(caps).length > 0) {
      overrides[module.id] = caps;
    }
  }
  return overrides;
};

/** Whether the profile carries any customisation (explicit set or any override). */
export const isCustomised = (permission: UserPermission): boolean =>
  permission.setId !== null || Object.keys(permission.overrides).length > 0;

export { BASE_CAP };
