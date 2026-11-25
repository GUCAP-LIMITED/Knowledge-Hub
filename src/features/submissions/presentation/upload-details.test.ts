import { describe, expect, it } from 'vitest';
import type { AudienceGroupState, BranchOption, UserScopeData } from '@features/content';
import {
  compileAudienceGroups,
  hydrateAudienceGroups,
  EMPTY_DETAILS,
  type Details,
} from './upload-details';

const branches: readonly BranchOption[] = [
  { id: 'b-a', name: 'Branch A' },
  { id: 'b-b', name: 'Branch B' },
  { id: 'b-c', name: 'Branch C' },
  { id: 'b-d', name: 'Branch D' },
];

const userScope: UserScopeData = {
  branches,
  teams: [
    { id: 't-a', name: 'Team A' },
    { id: 't-b', name: 'Team B' },
  ],
};

describe('upload-details audience compilation & hydration', () => {
  it('Scenario 7: compiles private mode to active branch with no teams', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: false,
        branchIds: ['b-a'],
        accessType: 'teams',
        teamIds: ['t-a'],
      },
    ];

    const result = compileAudienceGroups(groups, 'private', branches, 'b-active');
    expect(result).toEqual({
      branches: ['b-active'],
      teams: [],
      visibility: 'private',
    });
  });

  it('Scenario 1: compiles single group with Branch A and Team A', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: false,
        branchIds: ['b-a'],
        accessType: 'teams',
        teamIds: ['t-a'],
      },
    ];

    const result = compileAudienceGroups(groups, 'team', branches);
    expect(result).toEqual({
      branches: ['b-a'],
      teams: ['t-a'],
      visibility: 'team',
    });
  });

  it('Scenario 2: compiles public access for Branch B', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: false,
        branchIds: ['b-b'],
        accessType: 'public',
        teamIds: [],
      },
    ];

    const result = compileAudienceGroups(groups, 'team', branches);
    expect(result).toEqual({
      branches: ['b-b'],
      teams: [],
      visibility: 'public',
    });
  });

  it('Multi-group Scenarios (Group 1: Branch-A+Team-A, Group 2: Branch-B+Public, Group 3: Branch-C+Team-B)', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: false,
        branchIds: ['b-a'],
        accessType: 'teams',
        teamIds: ['t-a'],
      },
      {
        id: '2',
        isAllBranches: false,
        branchIds: ['b-b'],
        accessType: 'public',
        teamIds: [],
      },
      {
        id: '3',
        isAllBranches: false,
        branchIds: ['b-c'],
        accessType: 'teams',
        teamIds: ['t-b'],
      },
    ];

    const result = compileAudienceGroups(groups, 'team', branches);
    expect(result.branches).toEqual(['b-a', 'b-b', 'b-c']);
    expect(result.teams).toEqual(['t-a', 't-b']);
    expect(result.visibility).toBe('team');
  });

  it('Scenario 5: compiles All Branches with Team A to empty branch array', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: true,
        branchIds: [],
        accessType: 'teams',
        teamIds: ['t-a'],
      },
    ];

    const result = compileAudienceGroups(groups, 'team', branches);
    expect(result.branches).toEqual([]);
    expect(result.teams).toEqual(['t-a']);
    expect(result.visibility).toBe('team');
  });

  it('Scenario 6: compiles All Branches with Public access to empty branch array', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: true,
        branchIds: [],
        accessType: 'public',
        teamIds: [],
      },
    ];

    const result = compileAudienceGroups(groups, 'team', branches);
    expect(result).toEqual({
      branches: [],
      teams: [],
      visibility: 'public',
    });
  });

  it('Scenario 8: compiles empty groups to empty branch array and public visibility', () => {
    const result = compileAudienceGroups([], 'team', branches);
    expect(result).toEqual({
      branches: [],
      teams: [],
      visibility: 'public',
    });
  });

  it('Scenario 9: explicitly selecting all accessible branches preserves branch IDs and does not collapse to empty array', () => {
    const groups: AudienceGroupState[] = [
      {
        id: '1',
        isAllBranches: false,
        branchIds: ['b-a', 'b-b', 'b-c', 'b-d'],
        accessType: 'public',
        teamIds: [],
      },
    ];

    const result = compileAudienceGroups(groups, 'public', branches);
    expect(result.branches).toEqual(['b-a', 'b-b', 'b-c', 'b-d']);
    expect(result.visibility).toBe('public');
  });

  it('hydrates audience groups from existing details with explicit branches', () => {
    const details: Details = {
      ...EMPTY_DETAILS,
      branches: ['b-a', 'b-b'],
      teams: ['t-a'],
      visibility: 'team',
    };

    const hydrated = hydrateAudienceGroups(details, userScope);
    expect(hydrated.length).toBe(1);
    expect(hydrated[0]?.isAllBranches).toBe(false);
    expect(hydrated[0]?.branchIds).toEqual(['b-a', 'b-b']);
    expect(hydrated[0]?.teamIds).toEqual(['t-a']);
  });

  it('hydrates audience groups from existing details with empty branches as All Branches', () => {
    const details: Details = {
      ...EMPTY_DETAILS,
      branches: [],
      teams: [],
      visibility: 'public',
    };

    const hydrated = hydrateAudienceGroups(details, userScope);
    expect(hydrated.length).toBe(1);
    expect(hydrated[0]?.isAllBranches).toBe(true);
    expect(hydrated[0]?.branchIds).toEqual([]);
    expect(hydrated[0]?.accessType).toBe('public');
  });

  it('hydrates audience groups with all accessible branch IDs without collapsing to isAllBranches', () => {
    const details: Details = {
      ...EMPTY_DETAILS,
      branches: ['b-a', 'b-b', 'b-c', 'b-d'],
      teams: [],
      visibility: 'public',
    };

    const hydrated = hydrateAudienceGroups(details, userScope);
    expect(hydrated.length).toBe(1);
    expect(hydrated[0]?.isAllBranches).toBe(false);
    expect(hydrated[0]?.branchIds).toEqual(['b-a', 'b-b', 'b-c', 'b-d']);
  });

  it('hydrates audience groups with empty branches and specific team as All Branches', () => {
    const details: Details = {
      ...EMPTY_DETAILS,
      branches: [],
      teams: ['t-a'],
      visibility: 'team',
    };

    const hydrated = hydrateAudienceGroups(details, userScope);
    expect(hydrated.length).toBe(1);
    expect(hydrated[0]?.isAllBranches).toBe(true);
    expect(hydrated[0]?.branchIds).toEqual([]);
    expect(hydrated[0]?.accessType).toBe('teams');
    expect(hydrated[0]?.teamIds).toEqual(['t-a']);
  });
});
