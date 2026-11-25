import { USER_TYPE_IDS } from './mock-users';

export interface MockUserType {
  id: string;
  name: string;
  description: string | null;
  canLogin: boolean;
  isAdmin: boolean;
  displayOrder: number;
  hierarchyLevel: number;
  /** 0 Self · 5 Team · 10 BranchAll · 15 FullAccess. */
  dataAccessScope: number;
  isDefault: boolean;
  creationTime: string;
}

export const USER_TYPE_LEAD_ID = 'ut-team-lead';
export const USER_TYPE_STUDENT_ID = 'ut-student-ambassador';

export const createUserTypes = (): MockUserType[] => [
  {
    id: USER_TYPE_IDS.admin,
    name: 'Admin',
    description: 'Full platform administration',
    canLogin: true,
    isAdmin: true,
    displayOrder: 0,
    hierarchyLevel: 0,
    dataAccessScope: 15,
    isDefault: true,
    creationTime: '2025-11-01T09:00:00Z',
  },
  {
    id: USER_TYPE_IDS.manager,
    name: 'BranchManager',
    description: 'Runs a branch and approves its content',
    canLogin: true,
    isAdmin: false,
    displayOrder: 1,
    hierarchyLevel: 5,
    dataAccessScope: 10,
    isDefault: true,
    creationTime: '2025-11-01T09:00:00Z',
  },
  {
    id: USER_TYPE_LEAD_ID,
    name: 'TeamLead',
    description: 'Leads a team of consultants',
    canLogin: true,
    isAdmin: false,
    displayOrder: 2,
    hierarchyLevel: 7,
    dataAccessScope: 5,
    isDefault: false,
    creationTime: '2025-12-04T09:00:00Z',
  },
  {
    id: USER_TYPE_IDS.consultant,
    name: 'Consultant',
    description: 'Front-line education consultant',
    canLogin: true,
    isAdmin: false,
    displayOrder: 3,
    hierarchyLevel: 10,
    dataAccessScope: 0,
    isDefault: true,
    creationTime: '2025-11-01T09:00:00Z',
  },
  {
    id: USER_TYPE_STUDENT_ID,
    name: 'StudentAmbassador',
    description: 'Part-time ambassadors (no Academy login)',
    canLogin: false,
    isAdmin: false,
    displayOrder: 4,
    hierarchyLevel: 15,
    dataAccessScope: 0,
    isDefault: false,
    creationTime: '2026-01-09T09:00:00Z',
  },
];

export interface MockTeam {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  userTypeIds: string[];
}

export const createTeams = (): MockTeam[] => [
  {
    id: 'team-admissions',
    name: 'Admissions',
    description: 'Handles enquiries through to enrolment',
    isActive: true,
    userTypeIds: [USER_TYPE_IDS.consultant, USER_TYPE_LEAD_ID],
  },
  {
    id: 'team-support',
    name: 'Student Support',
    description: 'Pastoral care and escalations',
    isActive: true,
    userTypeIds: [USER_TYPE_IDS.consultant],
  },
  {
    id: 'team-partnerships',
    name: 'Partnerships',
    description: 'Agents, schools and referral partners',
    isActive: false,
    userTypeIds: [USER_TYPE_IDS.manager],
  },
];

export interface MockBranch {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly isPrimary: boolean;
}

export const BRANCHES: readonly MockBranch[] = [
  { id: 'branch-london', name: 'London', code: 'LON', isPrimary: true },
  { id: 'branch-manchester', name: 'Manchester', code: 'MAN', isPrimary: false },
];
