import { normalizeQuery, notFound, paginate } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import type { MockRequest, MockRoute } from '../mock-types';
import type { MockTeam } from '../seed/org-seed';

const BASE = '/api/app/team';

const find = (state: MockState, id: string): MockTeam => {
  const team = state.teams.find((t) => t.id === id);
  if (team === undefined) {
    throw notFound('Team');
  }
  return team;
};

const toDto = (state: MockState, team: MockTeam): Record<string, unknown> => ({
  id: team.id,
  name: team.name,
  description: team.description,
  isActive: team.isActive,
  members: team.userTypeIds.map((id) => ({
    userTypeId: id,
    userTypeName: state.userTypes.find((t) => t.id === id)?.name ?? null,
  })),
});

const input = (
  request: MockRequest,
): Pick<MockTeam, 'name' | 'description' | 'userTypeIds'> =>
  request.body as Pick<MockTeam, 'name' | 'description' | 'userTypeIds'>;

export const teamHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: BASE,
    handler: ({ query }) => {
      const page = paginate(state.teams, normalizeQuery(query));
      return {
        totalCount: page.totalCount,
        items: page.items.map((t) => toDto(state, t)),
      };
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/selectable-user-types`,
    handler: () => state.userTypes.map((t) => ({ id: t.id, name: t.name })),
  },
  {
    method: 'POST',
    pattern: BASE,
    handler: (request) => {
      const team: MockTeam = {
        id: nextId(state, 'team'),
        isActive: true,
        ...input(request),
      };
      state.teams.push(team);
      return toDto(state, team);
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const team = find(state, request.params.id ?? '');
      Object.assign(team, input(request));
      return toDto(state, team);
    },
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      state.teams.splice(state.teams.indexOf(find(state, request.params.id ?? '')), 1);
      return null;
    },
  },
];
