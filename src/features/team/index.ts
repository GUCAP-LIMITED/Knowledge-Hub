/**
 * Public API of the `team` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype roster (swap for HTTP to go live).
 */
export { createTeamModule, type TeamModule, type TeamModuleDeps } from './team-module';
export { TeamModuleProvider, useTeamMembers, teamQueryKey } from './presentation';
export { TeamMember, type TeamMemberProps } from './domain';
