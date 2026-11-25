import { USER_TYPE_IDS } from './mock-users';
import { USER_TYPE_LEAD_ID } from './org-seed';

export interface DirectoryUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly userTypeId: string;
  readonly branchIds: readonly string[];
  readonly teamId: string | null;
  isActive: boolean;
  /** Permission-set override for this user (absent = their user-type default). */
  permissionSetId?: string | undefined;
  readonly grants: Set<string>;
  readonly denies: Set<string>;
}

interface UserSpec {
  readonly id: string;
  readonly name: string;
  readonly userTypeId: string;
  readonly branchIds: readonly string[];
  readonly teamId: string | null;
  readonly isActive?: boolean;
  readonly email?: string;
}

const u = (spec: UserSpec): DirectoryUser => ({
  id: spec.id,
  name: spec.name,
  email: spec.email ?? `${spec.name.toLowerCase().replace(/[^a-z]+/g, '.')}@uapp.com`,
  userTypeId: spec.userTypeId,
  branchIds: spec.branchIds,
  teamId: spec.teamId,
  isActive: spec.isActive ?? true,
  grants: new Set<string>(),
  denies: new Set<string>(),
});

export const createDirectory = (): DirectoryUser[] => [
  u({
    id: 'user-admin',
    name: 'Amelia Hart',
    userTypeId: USER_TYPE_IDS.admin,
    branchIds: [],
    teamId: null,
    email: 'admin@uapp.com',
  }),
  u({
    id: 'user-manager',
    name: 'Daniel Okafor',
    userTypeId: USER_TYPE_IDS.manager,
    branchIds: ['branch-london'],
    teamId: 'team-admissions',
    email: 'manager@uapp.com',
  }),
  u({
    id: 'user-consultant',
    name: 'Priya Nair',
    userTypeId: USER_TYPE_IDS.consultant,
    branchIds: ['branch-london'],
    teamId: 'team-admissions',
    email: 'consultant@uapp.com',
  }),
  u({
    id: 'user-lead-1',
    name: 'Marcus Webb',
    userTypeId: USER_TYPE_LEAD_ID,
    branchIds: ['branch-london'],
    teamId: 'team-admissions',
  }),
  u({
    id: 'user-cons-2',
    name: 'Sofia Alvarez',
    userTypeId: USER_TYPE_IDS.consultant,
    branchIds: ['branch-london'],
    teamId: 'team-admissions',
  }),
  u({
    id: 'user-cons-3',
    name: 'Tariq Rahman',
    userTypeId: USER_TYPE_IDS.consultant,
    branchIds: ['branch-london'],
    teamId: 'team-support',
  }),
  u({
    id: 'user-cons-4',
    name: 'Hannah Clarke',
    userTypeId: USER_TYPE_IDS.consultant,
    branchIds: ['branch-manchester'],
    teamId: 'team-support',
  }),
  u({
    id: 'user-cons-5',
    name: 'Ife Adeyemi',
    userTypeId: USER_TYPE_IDS.consultant,
    branchIds: ['branch-manchester'],
    teamId: 'team-admissions',
  }),
  u({
    id: 'user-cons-6',
    name: 'Lena Fischer',
    userTypeId: USER_TYPE_IDS.consultant,
    branchIds: ['branch-manchester'],
    teamId: 'team-admissions',
    isActive: false,
  }),
  u({
    id: 'user-mgr-2',
    name: 'Oliver Grant',
    userTypeId: USER_TYPE_IDS.manager,
    branchIds: ['branch-manchester'],
    teamId: null,
  }),
];
