import { DEFAULT_GRANTS, allPermissionKeys } from './permission-catalog';
import { USER_TYPE_IDS } from './mock-users';

export interface MockPermissionSet {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  isSystemDefault: boolean;
  grants: Set<string>;
}

export const PERMISSION_SET_IDS = {
  full: 'pset-full-access',
  manager: 'pset-manager',
  learner: 'pset-learner',
} as const;

export const createPermissionSets = (): MockPermissionSet[] => [
  {
    id: PERMISSION_SET_IDS.full,
    name: 'FullAccess',
    description: 'Complete access to every module',
    color: '#059669',
    bgColor: '#D1FAE5',
    isSystemDefault: true,
    grants: new Set(allPermissionKeys()),
  },
  {
    id: PERMISSION_SET_IDS.manager,
    name: 'BranchManager',
    description: 'Manage a branch: approvals, assignments and team progress',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    isSystemDefault: true,
    grants: new Set(DEFAULT_GRANTS[USER_TYPE_IDS.manager]),
  },
  {
    id: PERMISSION_SET_IDS.learner,
    name: 'Learner',
    description: 'Learn, contribute and review',
    color: '#D97706',
    bgColor: '#FEF3C7',
    isSystemDefault: true,
    grants: new Set(DEFAULT_GRANTS[USER_TYPE_IDS.consultant]),
  },
];

/** user type id -> permission set id. */
export const createTypeDefaults = (): Map<string, string> =>
  new Map([
    [USER_TYPE_IDS.admin, PERMISSION_SET_IDS.full],
    [USER_TYPE_IDS.manager, PERMISSION_SET_IDS.manager],
    [USER_TYPE_IDS.consultant, PERMISSION_SET_IDS.learner],
  ]);
