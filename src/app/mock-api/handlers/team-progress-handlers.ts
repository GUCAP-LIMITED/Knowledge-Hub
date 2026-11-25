import { allLessons } from '../course-view';
import { normalizeQuery, paginate, requireUser, sortBy } from '../mock-context';
import type { MockState } from '../mock-state';
import type { MockRequest, MockRoute } from '../mock-types';
import type { DirectoryUser } from '../seed/directory-seed';
import type { MockUser } from '../seed/mock-users';

const BASE = '/api/app/team-progress';
const AT_RISK_BELOW = 50;

interface Member {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly progress: number;
  readonly completed: number;
  readonly total: number;
  readonly lastActive: string;
  readonly status: 'online' | 'offline' | 'away';
}

const relative = (state: MockState, iso: string | null): string => {
  if (iso === null) return 'Never';
  const hours = Math.max(
    0,
    Math.round((state.now.getTime() - Date.parse(iso)) / 3_600_000),
  );
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${String(hours)}h ago`;
  return `${String(Math.round(hours / 24))}d ago`;
};

const toMember = (state: MockState, user: DirectoryUser): Member => {
  const rows = state.enrollments.filter((e) => e.userId === user.id);
  const lessons = rows.flatMap((e) => {
    const course = state.courses.find((c) => c.id === e.courseId);
    return course === undefined
      ? []
      : [{ done: e.completedLessons.size, all: allLessons(course).length }];
  });
  const all = lessons.reduce((s, l) => s + l.all, 0);
  const done = lessons.reduce((s, l) => s + l.done, 0);
  const last =
    rows
      .map((e) => e.lastAccessedAt)
      .filter((d): d is string => d !== null)
      .sort()
      .pop() ?? null;
  const hoursAgo =
    last === null ? Infinity : (state.now.getTime() - Date.parse(last)) / 3_600_000;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: state.userTypes.find((t) => t.id === user.userTypeId)?.name ?? 'Member',
    progress: all === 0 ? 0 : Math.round((done / all) * 100),
    completed: rows.filter((e) => e.status === 15).length,
    total: rows.length,
    lastActive: relative(state, last),
    status: hoursAgo < 6 ? 'online' : hoursAgo < 48 ? 'away' : 'offline',
  };
};

const scopeOf = (state: MockState, viewer: MockUser): Member[] =>
  state.directory
    .filter((u) => {
      if (!u.isActive || u.id === viewer.id) return false;
      if (viewer.dataScope >= 15) return true;
      if (viewer.dataScope >= 10)
        return u.branchIds.some((b) => viewer.branchIds.includes(b));
      return u.teamId !== null && viewer.teamIds.includes(u.teamId);
    })
    .map((u) => toMember(state, u));

const BANDS = [
  { key: 'risk', label: 'At risk (0–49%)', min: 0, max: 49 },
  { key: 'progressing', label: 'Progressing (50–74%)', min: 50, max: 74 },
  { key: 'onTrack', label: 'On track (75–99%)', min: 75, max: 99 },
  { key: 'complete', label: 'Complete (100%)', min: 100, max: 100 },
] as const;

const overview = (state: MockState, request: MockRequest): unknown => {
  const members = scopeOf(state, requireUser(request));
  const count = (min: number, max: number): number =>
    members.filter((m) => m.progress >= min && m.progress <= max).length;
  const atRisk = members.filter((m) => m.progress < AT_RISK_BELOW);
  const avg =
    members.length === 0
      ? 0
      : Math.round(members.reduce((s, m) => s + m.progress, 0) / members.length);
  const ids = new Set(members.map((m) => m.id));
  return {
    totalMembers: members.length,
    avgProgress: avg,
    activeNow: members.filter((m) => m.status === 'online').length,
    atRisk: atRisk.length,
    teamTotalCourses: members.reduce((s, m) => s + m.total, 0),
    teamCompletedCourses: members.reduce((s, m) => s + m.completed, 0),
    progressDistribution: {
      risk: count(0, 49),
      progressing: count(50, 74),
      onTrack: count(75, 99),
      complete: count(100, 100),
      bands: BANDS.map((b) => ({ ...b, count: count(b.min, b.max) })),
    },
    members,
    atRiskMembers: atRisk,
    certificatesEarnedDates: state.enrollments
      .filter((e) => ids.has(e.userId) && e.completedAt !== null)
      .map((e) => e.completedAt),
  };
};

const SORTERS = {
  name: (m: Member): string => m.name,
  progress: (m: Member): number => m.progress,
  completed: (m: Member): number => m.completed,
} as const;

const members = (state: MockState, request: MockRequest, riskOnly: boolean): unknown => {
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const matches = scopeOf(state, requireUser(request)).filter(
    (m) =>
      (!riskOnly && query.atrisk !== 'true' ? true : m.progress < AT_RISK_BELOW) &&
      `${m.name} ${m.email}`.toLowerCase().includes(needle),
  );
  return paginate(sortBy(matches, query.sorting, SORTERS), query);
};

export const teamProgressHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: `${BASE}/overview`, handler: (r) => overview(state, r) },
  { method: 'GET', pattern: `${BASE}/members`, handler: (r) => members(state, r, false) },
  {
    method: 'GET',
    pattern: `${BASE}/at-risk-members`,
    handler: (r) => members(state, r, true),
  },
];
