import type { BranchUser } from '../domain';

/** Best available human label for a user: full name, then username, then email, then a dash. */
export const userDisplayName = (user: BranchUser): string =>
  user.name ?? user.userName ?? user.email ?? '—';
