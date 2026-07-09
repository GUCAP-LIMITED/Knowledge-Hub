import {
  PERMISSION_MODULES,
  type PermState,
  type PermissionSet,
} from './permission-catalogue';

export * from './permission-catalogue';

const buildPerms = (
  enabledIds: readonly string[],
  overrides: Record<string, Record<string, boolean>> = {},
): PermState => {
  const result: PermState = {};
  for (const mod of PERMISSION_MODULES) {
    const on = enabledIds.includes(mod.id);
    const perms: Record<string, boolean> = { [mod.base.id]: on };
    for (const g of mod.granular) {
      perms[g.id] = on;
    }
    result[mod.id] = { ...perms, ...(overrides[mod.id] ?? {}) };
  }
  return result;
};

const ALL = PERMISSION_MODULES.map((m) => m.id);
const MANAGER = [
  'courses',
  'mylearning',
  'tutorials',
  'resources',
  'certificates',
  'upload',
  'submissions',
  'team',
  'assign',
];
const CONSULTANT = ['courses', 'mylearning', 'tutorials', 'resources', 'certificates'];

/** The three seeded permission sets (Full is the locked system default). */
export const INITIAL_PERMISSION_SETS: readonly PermissionSet[] = [
  {
    id: 'full',
    label: 'Full Access',
    desc: 'Complete access to all Knowledge Hub features',
    locked: true,
    perms: buildPerms(ALL),
  },
  {
    id: 'manager',
    label: 'Manager Access',
    desc: 'Upload content, track team, full learning access',
    perms: buildPerms(MANAGER, {
      upload: { access: true, submit: true, publish: false },
    }),
  },
  {
    id: 'consultant',
    label: 'Consultant Access',
    desc: 'Standard learner — courses, tutorials, resources & certificates',
    perms: buildPerms(CONSULTANT),
  },
];

/** Count of enabled permissions (base + granular) in a set. */
export const countEnabled = (set: PermissionSet): number =>
  PERMISSION_MODULES.reduce((total, mod) => {
    const perms = set.perms[mod.id] ?? {};
    const ids = [mod.base.id, ...mod.granular.map((g) => g.id)];
    return total + ids.filter((id) => perms[id] === true).length;
  }, 0);
