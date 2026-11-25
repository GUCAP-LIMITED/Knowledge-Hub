export type MockDataScope = 0 | 5 | 10 | 15;

export interface MockUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly userTypeId: string;
  readonly userTypeName: string;
  readonly isGlobal: boolean;
  /** Mirrors the backend scope: 0 Self · 5 Team · 10 BranchAll · 15 FullAccess. */
  readonly dataScope: MockDataScope;
  readonly branchIds: readonly string[];
  readonly teamIds: readonly string[];
  readonly teamNames: readonly string[];
}

export const USER_TYPE_IDS = {
  admin: 'ut-admin',
  manager: 'ut-branch-manager',
  consultant: 'ut-consultant',
} as const;

/** The demo directory the mock portal offers. Passwordless — this build has no real backend. */
export const MOCK_USERS: readonly MockUser[] = [
  {
    id: 'user-admin',
    name: 'Amelia Hart',
    email: 'admin@uapp.com',
    userTypeId: USER_TYPE_IDS.admin,
    userTypeName: 'Admin',
    isGlobal: true,
    dataScope: 15,
    branchIds: [],
    teamIds: [],
    teamNames: [],
  },
  {
    id: 'user-manager',
    name: 'Daniel Okafor',
    email: 'manager@uapp.com',
    userTypeId: USER_TYPE_IDS.manager,
    userTypeName: 'BranchManager',
    isGlobal: false,
    dataScope: 10,
    branchIds: ['branch-london'],
    teamIds: ['team-admissions'],
    teamNames: ['Admissions'],
  },
  {
    id: 'user-consultant',
    name: 'Priya Nair',
    email: 'consultant@uapp.com',
    userTypeId: USER_TYPE_IDS.consultant,
    userTypeName: 'Consultant',
    isGlobal: false,
    dataScope: 0,
    branchIds: ['branch-london'],
    teamIds: ['team-admissions'],
    teamNames: ['Admissions'],
  },
];

export const findMockUser = (id: string | null): MockUser | undefined =>
  MOCK_USERS.find((user) => user.id === id);
