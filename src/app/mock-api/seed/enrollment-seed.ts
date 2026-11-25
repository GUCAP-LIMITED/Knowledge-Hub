import { COURSE_SEEDS } from './course-seed';

export type EnrollmentStatusValue = 0 | 5 | 10 | 15;

export interface MockEnrollment {
  readonly id: string;
  readonly userId: string;
  readonly courseId: string;
  status: EnrollmentStatusValue;
  /** lessonId -> ISO completion time. */
  readonly completedLessons: Map<string, string>;
  /** 1 = Self, 2 = Assigned. */
  readonly origin: 1 | 2;
  /** 1 = Me, 2 = Team, 3 = Role — only meaningful when assigned. */
  readonly assignedScope: 1 | 2 | 3 | null;
  readonly dueDate: string | null;
  readonly enrolledAt: string;
  lastAccessedAt: string | null;
  completedAt: string | null;
}

const daysFrom = (now: Date, days: number): string =>
  new Date(now.getTime() + days * 86_400_000).toISOString();

const lessonIds = (courseId: string): string[] =>
  (COURSE_SEEDS.find((c) => c.id === courseId)?.sections ?? []).flatMap((s) =>
    s.lessons.map((l) => l.id),
  );

interface Spec {
  readonly userId: string;
  readonly courseId: string;
  readonly done: number | 'all';
  readonly origin?: 1 | 2;
  readonly dueInDays?: number;
  readonly startedDaysAgo: number;
}

const SPECS: readonly Spec[] = [
  {
    userId: 'user-consultant',
    courseId: 'course-welcome',
    done: 'all',
    origin: 2,
    dueInDays: -10,
    startedDaysAgo: 30,
  },
  {
    userId: 'user-consultant',
    courseId: 'course-admissions',
    done: 2,
    origin: 2,
    dueInDays: 6,
    startedDaysAgo: 9,
  },
  {
    userId: 'user-consultant',
    courseId: 'course-compliance',
    done: 0,
    origin: 2,
    dueInDays: -2,
    startedDaysAgo: 4,
  },
  {
    userId: 'user-consultant',
    courseId: 'course-communication',
    done: 1,
    startedDaysAgo: 3,
  },
  { userId: 'user-manager', courseId: 'course-welcome', done: 'all', startedDaysAgo: 40 },
  {
    userId: 'user-manager',
    courseId: 'course-admissions',
    done: 'all',
    startedDaysAgo: 35,
  },
  {
    userId: 'user-manager',
    courseId: 'course-compliance',
    done: 2,
    origin: 2,
    dueInDays: 12,
    startedDaysAgo: 5,
  },
  { userId: 'user-admin', courseId: 'course-welcome', done: 'all', startedDaysAgo: 60 },
  { userId: 'user-lead-1', courseId: 'course-welcome', done: 'all', startedDaysAgo: 45 },
  { userId: 'user-lead-1', courseId: 'course-admissions', done: 4, startedDaysAgo: 12 },
  { userId: 'user-cons-2', courseId: 'course-welcome', done: 'all', startedDaysAgo: 28 },
  { userId: 'user-cons-2', courseId: 'course-admissions', done: 3, startedDaysAgo: 10 },
  {
    userId: 'user-cons-2',
    courseId: 'course-compliance',
    done: 1,
    origin: 2,
    dueInDays: 9,
    startedDaysAgo: 3,
  },
  { userId: 'user-cons-3', courseId: 'course-welcome', done: 3, startedDaysAgo: 20 },
  { userId: 'user-cons-4', courseId: 'course-welcome', done: 'all', startedDaysAgo: 33 },
  { userId: 'user-cons-4', courseId: 'course-support', done: 'all', startedDaysAgo: 15 },
  { userId: 'user-cons-5', courseId: 'course-welcome', done: 1, startedDaysAgo: 6 },
];

export const createEnrollments = (now: Date): MockEnrollment[] =>
  SPECS.map((spec, index) => {
    const ids = lessonIds(spec.courseId);
    const count = spec.done === 'all' ? ids.length : spec.done;
    const completed = new Map(
      ids
        .slice(0, count)
        .map((id) => [id, daysFrom(now, -Math.max(1, spec.startedDaysAgo - 1))]),
    );
    const isDone = count === ids.length && ids.length > 0;
    return {
      id: `enr-${String(index + 1)}`,
      userId: spec.userId,
      courseId: spec.courseId,
      status: isDone ? 15 : count > 0 ? 5 : 0,
      completedLessons: completed,
      origin: spec.origin ?? 1,
      assignedScope: spec.origin === 2 ? 1 : null,
      dueDate: spec.dueInDays === undefined ? null : daysFrom(now, spec.dueInDays),
      enrolledAt: daysFrom(now, -spec.startedDaysAgo),
      lastAccessedAt: count > 0 ? daysFrom(now, -1) : null,
      completedAt: isDone ? daysFrom(now, -Math.max(1, spec.startedDaysAgo - 2)) : null,
    };
  });
