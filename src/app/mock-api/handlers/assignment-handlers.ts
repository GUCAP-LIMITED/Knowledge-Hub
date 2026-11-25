import { findRef } from '../content-index';
import { allLessons } from '../course-view';
import { normalizeQuery, notFound, paginate, requireUser } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import type { MockAssignment, MockAssigneeRef } from '../seed/assignment-seed';
import type { MockEnrollment } from '../seed/enrollment-seed';

const BASE = '/api/app/training-assignment';

/** Directory user ids an assignment resolves to (a user, everyone on a team, or everyone of a type). */
const targetUserIds = (state: MockState, assignee: MockAssigneeRef): string[] => {
  if (assignee.category === 1) return [assignee.targetId];
  const key = assignee.category === 2 ? 'teamId' : 'userTypeId';
  return state.directory
    .filter((u) => u[key] === assignee.targetId && u.isActive)
    .map((u) => u.id);
};

const enrollmentsFor = (state: MockState, assignment: MockAssignment): MockEnrollment[] =>
  assignment.assignees
    .flatMap((a) => targetUserIds(state, a))
    .flatMap((userId) =>
      state.enrollments.filter(
        (e) => e.userId === userId && e.courseId === assignment.contentItemId,
      ),
    );

/** 1 active · 2 completed · 3 overdue. */
const statusOf = (
  state: MockState,
  assignment: MockAssignment,
  progress: number,
): 1 | 2 | 3 => {
  if (assignment.forcedStatus !== undefined) return assignment.forcedStatus;
  if (progress >= 100) return 2;
  return Date.parse(assignment.dueDate) < state.now.getTime() ? 3 : 1;
};

const progressOf = (state: MockState, assignment: MockAssignment): number => {
  const course = state.courses.find((c) => c.id === assignment.contentItemId);
  const rows = enrollmentsFor(state, assignment);
  if (course === undefined || rows.length === 0) return 0;
  const total = allLessons(course).length * rows.length;
  const done = rows.reduce((s, e) => s + e.completedLessons.size, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
};

const STATUS_NAMES = { 1: 'Active', 2: 'Completed', 3: 'Overdue' } as const;

const toDto = (state: MockState, assignment: MockAssignment): Record<string, unknown> => {
  const ref = findRef(state, assignment.contentItemId);
  const progress = progressOf(state, assignment);
  const status = statusOf(state, assignment, progress);
  return {
    id: assignment.id,
    contentItemId: assignment.contentItemId,
    contentTitle: ref?.title ?? 'Unknown content',
    contentType: ref?.type ?? 0,
    contentTypeName: ref?.typeName ?? 'Course',
    assignees: assignment.assignees,
    dueDate: assignment.dueDate,
    status,
    statusName: STATUS_NAMES[status],
    progress,
  };
};

const list = (state: MockState, request: MockRequest): unknown => {
  const query = normalizeQuery(request.query);
  const dtos = state.assignments.map((a) => toDto(state, a));
  const needle = (query.search ?? '').toLowerCase();
  const matches = dtos.filter(
    (d) =>
      (query.status === undefined ||
        String(d.statusName).toLowerCase() === query.status) &&
      String(d.contentTitle).toLowerCase().includes(needle),
  );
  const count = (name: string): number =>
    dtos.filter((d) => d.statusName === name).length;
  return {
    ...paginate(matches, query),
    activeCount: count('Active'),
    completedCount: count('Completed'),
    overdueCount: count('Overdue'),
  };
};

interface CreateBody {
  readonly contentItemId: string;
  readonly assignees: readonly MockAssigneeRef[];
  readonly dueDate: string;
}

const create = (state: MockState, request: MockRequest): unknown => {
  requireUser(request);
  const body = request.body as CreateBody;
  if (findRef(state, body.contentItemId) === undefined) {
    throw new MockHttpFailure(400, 'Choose a course to assign.');
  }
  const assignment: MockAssignment = {
    id: nextId(state, 'asg'),
    contentItemId: body.contentItemId,
    assignees: [...body.assignees],
    dueDate: body.dueDate,
    createdAt: state.now.toISOString(),
  };
  state.assignments.unshift(assignment);
  // Assigning a course enrols each assignee, so it lands in their My Learning as "Assigned".
  for (const assignee of assignment.assignees) {
    for (const userId of targetUserIds(state, assignee)) {
      if (
        !state.enrollments.some(
          (e) => e.userId === userId && e.courseId === body.contentItemId,
        )
      ) {
        state.enrollments.push({
          id: nextId(state, 'enr'),
          userId,
          courseId: body.contentItemId,
          status: 0,
          completedLessons: new Map(),
          origin: 2,
          assignedScope: assignee.category === 1 ? 1 : assignee.category === 2 ? 2 : 3,
          dueDate: assignment.dueDate,
          enrolledAt: state.now.toISOString(),
          lastAccessedAt: null,
          completedAt: null,
        });
      }
    }
  }
  return toDto(state, assignment);
};

export const assignmentHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: BASE, handler: (r) => list(state, r) },
  { method: 'POST', pattern: BASE, handler: (r) => create(state, r) },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const index = state.assignments.findIndex((a) => a.id === request.params.id);
      if (index < 0) {
        throw notFound('Assignment');
      }
      state.assignments.splice(index, 1);
      return null;
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/assignable-users`,
    handler: ({ query }) => {
      const needle = (query.filter ?? '').toLowerCase();
      const max = Number(query.maxResultCount ?? 20);
      return state.directory
        .filter(
          (u) => u.isActive && `${u.name} ${u.email}`.toLowerCase().includes(needle),
        )
        .slice(0, max)
        .map((u) => {
          const [first = '', ...rest] = u.name.split(' ');
          return {
            id: u.id,
            name: first,
            surname: rest.join(' '),
            email: u.email,
            userName: u.email,
          };
        });
    },
  },
];
