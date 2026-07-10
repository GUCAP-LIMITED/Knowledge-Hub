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

/** A role in the organisation hierarchy (CEO at level 1 → Consultant at level 5). */
export interface Role {
  readonly id: string;
  readonly label: string;
  readonly level: number;
  readonly parentId: string | null;
  readonly description: string;
}

/** The org chart, top-down. Each role reports to its `parentId`. */
export const ROLES: readonly Role[] = [
  {
    id: 'ceo',
    label: 'CEO / System Admin',
    level: 1,
    parentId: null,
    description: 'Full control of every module and setting.',
  },
  {
    id: 'branch-manager',
    label: 'Branch Manager',
    level: 2,
    parentId: 'ceo',
    description: 'Runs a branch — manages content, approvals and the team.',
  },
  {
    id: 'manager',
    label: 'Manager',
    level: 3,
    parentId: 'branch-manager',
    description: 'Manages learning content and reviews submissions.',
  },
  {
    id: 'team-leader',
    label: 'Team Leader',
    level: 4,
    parentId: 'manager',
    description: 'Leads a small team and assigns training.',
  },
  {
    id: 'consultant',
    label: 'Consultant',
    level: 5,
    parentId: 'team-leader',
    description: 'Learner access — takes courses and submits content.',
  },
];

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

export interface PermissionModule {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly capabilities: readonly CapId[];
}

/** The modules of the Knowledge Hub, each with the capabilities that make sense for it. */
export const MODULES: readonly PermissionModule[] = [
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
    capabilities: ['view', 'create', 'edit', 'delete', 'publish', 'assign'],
  },
  {
    id: 'tutorials',
    label: 'Tutorials',
    icon: Lightbulb,
    capabilities: ['view', 'create', 'edit', 'delete', 'publish'],
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: FolderOpen,
    capabilities: ['view', 'create', 'edit', 'delete', 'publish'],
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    icon: ClipboardList,
    capabilities: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
    capabilities: ['view', 'issue', 'revoke'],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: Upload,
    capabilities: ['view', 'create'],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: ClipboardCheck,
    capabilities: ['view', 'approve', 'reject', 'publish'],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star,
    capabilities: ['view', 'moderate', 'delete'],
  },
  {
    id: 'team',
    label: 'Team',
    icon: BarChart3,
    capabilities: ['view', 'manage', 'assign'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    capabilities: ['view', 'invite', 'edit', 'deactivate'],
  },
  { id: 'settings', label: 'Settings', icon: Settings, capabilities: ['view', 'manage'] },
];

// The deepest role level (highest number) that gets a capability by default.
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

/** Sensible default: higher roles (lower level number) get more capabilities. */
export const defaultGrant = (roleLevel: number, cap: CapId): boolean =>
  roleLevel <= CAP_MAX_LEVEL[cap];

/** roleId → moduleId → capId → granted. */
export type PermissionMatrix = Record<
  string,
  Record<string, Partial<Record<CapId, boolean>>>
>;

/** Build the seed matrix from the default-grant heuristic. */
export const buildDefaultMatrix = (): PermissionMatrix => {
  const matrix: PermissionMatrix = {};
  for (const role of ROLES) {
    const modules: Record<string, Partial<Record<CapId, boolean>>> = {};
    for (const module of MODULES) {
      const caps: Partial<Record<CapId, boolean>> = {};
      for (const cap of module.capabilities) {
        caps[cap] = defaultGrant(role.level, cap);
      }
      modules[module.id] = caps;
    }
    matrix[role.id] = modules;
  }
  return matrix;
};

/** Count granted capabilities for a role across all modules. */
export const countGrants = (matrix: PermissionMatrix, roleId: string): number => {
  const modules = matrix[roleId] ?? {};
  return Object.values(modules).reduce(
    (total, caps) => total + Object.values(caps).filter(Boolean).length,
    0,
  );
};
