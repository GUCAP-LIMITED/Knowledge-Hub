import type { MockState } from '../mock-state';
import { requireUser } from '../mock-context';
import type { MockRoute } from '../mock-types';

interface EnumValue {
  readonly value: number;
  readonly name: string;
  readonly description: string;
}

const ENUMS: Readonly<Record<string, readonly EnumValue[]>> = {
  EnrollmentStatus: [
    { value: 0, name: 'NotStarted', description: 'Not Started' },
    { value: 5, name: 'InProgress', description: 'In Progress' },
    { value: 10, name: 'Paused', description: 'Paused' },
    { value: 15, name: 'Completed', description: 'Completed' },
  ],
  MyLearningStatus: [
    { value: 0, name: 'NotStarted', description: 'Not Started' },
    { value: 1, name: 'InProgress', description: 'In Progress' },
    { value: 2, name: 'Completed', description: 'Completed' },
    { value: 3, name: 'Overdue', description: 'Overdue' },
    { value: 4, name: 'Paused', description: 'Paused' },
  ],
  ContentDifficulty: [
    { value: 0, name: 'Beginner', description: 'Beginner' },
    { value: 5, name: 'Intermediate', description: 'Intermediate' },
    { value: 10, name: 'Advanced', description: 'Advanced' },
  ],
};

const BRANCHES = [
  { id: 'branch-london', name: 'London', code: 'LON', isPrimary: true },
  { id: 'branch-manchester', name: 'Manchester', code: 'MAN', isPrimary: false },
];

/** Enums, categories and the signed-in user's branch / team scope. */
export const referenceHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/enum/:name',
    handler: ({ params }) => ENUMS[params.name ?? ''] ?? [],
  },
  {
    method: 'GET',
    pattern: '/api/app/content-category/selectable',
    handler: ({ query }) =>
      state.categories.filter(
        (c) => query.type === undefined || c.type === Number(query.type),
      ),
  },
  {
    method: 'GET',
    pattern: '/api/app/branch/my',
    handler: (request) => {
      const user = requireUser(request);
      const mine = BRANCHES.filter((b) => user.isGlobal || user.branchIds.includes(b.id));
      return { items: mine };
    },
  },
  {
    method: 'GET',
    pattern: '/api/app/user/scope-data',
    handler: (request) => {
      const user = requireUser(request);
      return {
        branches: BRANCHES.filter((b) => user.isGlobal || user.branchIds.includes(b.id)),
        teams: user.teamIds.map((id, index) => ({
          id,
          name: user.teamNames[index] ?? id,
          description: null,
          isActive: true,
        })),
      };
    },
  },
];
