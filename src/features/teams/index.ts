/**
 * Public API of the teams feature. Other features and the app shell import ONLY from here.
 */
export {
  createTeamsModule,
  type TeamsModule,
  type TeamsModuleDeps,
} from './teams-module';
export {
  TeamsModuleProvider,
  useTeams,
  useSelectableUserTypes,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  teamsQueryKey,
} from './presentation';
export type { Team, TeamMember, SelectableUserType } from './domain';

// NOTE: TeamsPage is intentionally NOT re-exported — the router lazy-loads it from its module path
// so it can be code-split into its own chunk.
