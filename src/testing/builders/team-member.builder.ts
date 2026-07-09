import { TeamMember, type TeamMemberProps } from '@features/team/domain';

export type TeamMemberOverrides = Partial<TeamMemberProps>;

const DEFAULT_TEAM_MEMBER: TeamMemberProps = {
  id: 'tm-1',
  name: 'Simona',
  email: 'simona@uapp.com',
  role: 'Consultant',
  progress: 85,
  completed: 4,
  total: 5,
  lastActive: '2 hours ago',
  status: 'online',
};

/** Construct a valid {@link TeamMember} for tests, overriding only what matters per case. */
export const buildTeamMember = (overrides: TeamMemberOverrides = {}): TeamMember =>
  new TeamMember({ ...DEFAULT_TEAM_MEMBER, ...overrides });
