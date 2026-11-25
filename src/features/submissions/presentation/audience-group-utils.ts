import type { MultiSelectOption } from '@shared/ui';
import type { AudienceGroupState, BranchOption, TeamOption } from '@features/content';

export const resolveCommonTeams = (
  allTeams: readonly TeamOption[],
): readonly TeamOption[] => allTeams;

export const mapTeamOptions = (teams: readonly TeamOption[]): MultiSelectOption[] =>
  teams.map((t) => ({
    value: t.id,
    label: t.name,
  }));

export const filterValidTeamsForBranches = (
  currentTeamIds: readonly string[],
  allTeams: readonly TeamOption[],
): string[] => {
  const validTeamSet = new Set(allTeams.map((t) => t.id));
  return currentTeamIds.filter((tId) => validTeamSet.has(tId));
};

export const getAudienceGroupSummaries = (
  group: AudienceGroupState,
  _allBranchesCount?: number,
): { branchSummary: string; accessSummary: string } => {
  const isAll = group.isAllBranches && group.branchIds.length === 0;

  const branchCountStr = String(group.branchIds.length);
  const branchUnit = group.branchIds.length === 1 ? 'Branch' : 'Branches';
  const branchSummary = isAll ? 'All Branches' : `${branchCountStr} ${branchUnit}`;

  const teamCountStr = String(group.teamIds.length);
  const teamUnit = group.teamIds.length === 1 ? 'Team' : 'Teams';
  const accessSummary =
    group.accessType === 'public' ? 'Public in Branch' : `${teamCountStr} ${teamUnit}`;

  return { branchSummary, accessSummary };
};

export const buildAudienceSummary = (
  groups: readonly AudienceGroupState[],
  allBranches: readonly BranchOption[],
  allTeams: readonly TeamOption[],
  visibility: string,
): string => {
  if (visibility === 'private') {
    return 'Private — only author and elevated managers have access.';
  }
  if (groups.length === 0) {
    return 'Defaulting to all branches.';
  }
  return groups
    .map((g, idx) => {
      const isAll = g.isAllBranches && g.branchIds.length === 0;

      const branchLabel = isAll
        ? 'All Branches'
        : g.branchIds
            .map((bId) => allBranches.find((b) => b.id === bId)?.name)
            .filter((name): name is string => Boolean(name))
            .join(', ') || 'No branches selected';

      const accessLabel =
        g.accessType === 'public'
          ? 'Public'
          : g.teamIds.length === 0
            ? 'All Teams'
            : g.teamIds
                .map((tId) => allTeams.find((t) => t.id === tId)?.name)
                .filter((name): name is string => Boolean(name))
                .join(', ');

      return `Group ${String(idx + 1)}: ${accessLabel} in ${branchLabel}`;
    })
    .join(' · ');
};
