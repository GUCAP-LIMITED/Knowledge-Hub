import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FolderOpen,
  Lightbulb,
  Settings,
  Star,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';

/** Every capability an admin can grant. Modules declare which subset applies to them. */
export type CapId =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'publish'
  | 'assign'
  | 'approve'
  | 'reject'
  | 'moderate'
  | 'manage'
  | 'issue'
  | 'revoke'
  | 'invite'
  | 'deactivate';

/** The base capability every module hangs off — turning it off gates the rest. */
export const BASE_CAP: CapId = 'view';

export const CAP_LABEL: Record<CapId, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  publish: 'Publish',
  assign: 'Assign',
  approve: 'Approve',
  reject: 'Reject',
  moderate: 'Moderate',
  manage: 'Manage',
  issue: 'Issue',
  revoke: 'Revoke',
  invite: 'Invite',
  deactivate: 'Deactivate',
};

/** Short human explanation of what each capability lets a user do. */
export const CAP_DESC: Record<CapId, string> = {
  view: 'Access and read this module',
  create: 'Add new items',
  edit: 'Change existing items',
  delete: 'Remove items permanently',
  publish: 'Make items live for learners',
  assign: 'Assign items to people',
  approve: 'Approve items in the queue',
  reject: 'Send items back for changes',
  moderate: 'Moderate learner content',
  manage: 'Manage members and settings',
  issue: 'Issue certificates',
  revoke: 'Revoke issued certificates',
  invite: 'Invite new people',
  deactivate: 'Deactivate accounts',
};

export interface PermissionModule {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly capabilities: readonly CapId[];
}

/** The modules of the Knowledge Hub, each with the capabilities that make sense for it. */
export const MODULES: readonly PermissionModule[] = [
  {
    id: 'courses',
    label: 'Courses',
    description: 'Structured learning paths for staff',
    icon: BookOpen,
    capabilities: ['view', 'create', 'edit', 'delete', 'publish', 'assign'],
  },
  {
    id: 'tutorials',
    label: 'Tutorials',
    description: 'Short how-to video walkthroughs',
    icon: Lightbulb,
    capabilities: ['view', 'create', 'edit', 'delete', 'publish'],
  },
  {
    id: 'resources',
    label: 'Resources',
    description: 'Documents, templates and downloads',
    icon: FolderOpen,
    capabilities: ['view', 'create', 'edit', 'delete', 'publish'],
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    description: 'Assessments attached to courses',
    icon: ClipboardList,
    capabilities: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    description: 'Completion certificates for learners',
    icon: Award,
    capabilities: ['view', 'issue', 'revoke'],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    description: 'Content learners upload for review',
    icon: Upload,
    capabilities: ['view', 'create'],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    description: 'The publish-review queue',
    icon: ClipboardCheck,
    capabilities: ['view', 'approve', 'reject', 'publish'],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Ratings and written feedback',
    icon: Star,
    capabilities: ['view', 'moderate', 'delete'],
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Your branch team and progress',
    icon: BarChart3,
    capabilities: ['view', 'manage', 'assign'],
  },
  {
    id: 'users',
    label: 'Users',
    description: 'The platform-wide user directory',
    icon: Users,
    capabilities: ['view', 'invite', 'edit', 'deactivate'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Platform configuration',
    icon: Settings,
    capabilities: ['view', 'manage'],
  },
];

/** roleLevel/setLevel → moduleId → capId → granted. */
export type PermissionGrid = Record<string, Partial<Record<CapId, boolean>>>;

// The deepest access level (highest number) that gets a capability by default.
const CAP_MAX_LEVEL: Record<CapId, number> = {
  view: 5,
  create: 3,
  edit: 3,
  publish: 2,
  assign: 4,
  approve: 2,
  reject: 2,
  moderate: 3,
  manage: 2,
  delete: 1,
  issue: 2,
  revoke: 1,
  invite: 2,
  deactivate: 1,
};

/** Sensible default: higher access levels (lower number) get more capabilities. */
export const defaultGrant = (level: number, cap: CapId): boolean =>
  level <= CAP_MAX_LEVEL[cap];

/** Build a full grant grid for a representative access level (used to seed permission sets). */
export const buildGridForLevel = (level: number): PermissionGrid => {
  const grid: PermissionGrid = {};
  for (const module of MODULES) {
    const caps: Partial<Record<CapId, boolean>> = {};
    for (const cap of module.capabilities) {
      caps[cap] = defaultGrant(level, cap);
    }
    grid[module.id] = caps;
  }
  return grid;
};

const findModule = (moduleId: string): PermissionModule | undefined =>
  MODULES.find((module) => module.id === moduleId);

/**
 * Enforce the base-capability dependency inside one module: if `view` is off, every other
 * capability is cleared; a non-`view` capability can only be on while `view` is on.
 */
export const enforceModuleDeps = (
  grid: PermissionGrid,
  moduleId: string,
): PermissionGrid => {
  const module = findModule(moduleId);
  if (module === undefined) {
    return grid;
  }
  const caps = { ...(grid[moduleId] ?? {}) };
  if (caps[BASE_CAP] !== true) {
    for (const cap of module.capabilities) {
      if (cap !== BASE_CAP) {
        caps[cap] = false;
      }
    }
  }
  return { ...grid, [moduleId]: caps };
};

/** Count the granted capabilities of a module in a grid. */
export const countModuleGrants = (grid: PermissionGrid, moduleId: string): number => {
  const caps = grid[moduleId] ?? {};
  return Object.values(caps).filter(Boolean).length;
};

/** Count every granted capability across all modules in a grid. */
export const countGrid = (grid: PermissionGrid): number =>
  MODULES.reduce((total, module) => total + countModuleGrants(grid, module.id), 0);

/** Total number of capabilities a module exposes. */
export const moduleTotal = (moduleId: string): number =>
  findModule(moduleId)?.capabilities.length ?? 0;
