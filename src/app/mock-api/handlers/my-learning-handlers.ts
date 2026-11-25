import {
  catalogRefs,
  categoryName,
  certificateIdFor,
  ratingOf,
  type CatalogRef,
} from '../content-index';
import { paginate, requireUser, sortBy } from '../mock-context';
import type { MockCompletion, MockState } from '../mock-state';
import type { MockRoute } from '../mock-types';
import {
  allLessons,
  categoryNameOf,
  courseDurationSeconds,
  DIFFICULTY_NAMES,
  toCourseRow,
} from '../course-view';
import type { CourseSeed } from '../seed/course-seed';
import type { MockEnrollment } from '../seed/enrollment-seed';
import { svgThumb } from '../seed/svg-thumb';

const BASE = '/api/app/my-learning';
const DAY_MS = 86_400_000;

const STATUS_NAMES = [
  'Not Started',
  'In Progress',
  'Completed',
  'Overdue',
  'Paused',
] as const;

/** My-learning status: 0 NotStarted · 1 InProgress · 2 Completed · 3 Overdue · 4 Paused. */
const learningStatus = (enrollment: MockEnrollment, overdue: boolean): number => {
  if (enrollment.status === 15) return 2;
  if (overdue) return 3;
  if (enrollment.status === 10) return 4;
  return enrollment.status === 5 ? 1 : 0;
};

const ACTION_LABELS = [
  'Start course',
  'Continue',
  'View course',
  'Continue',
  'Resume',
] as const;

const toItem = (
  state: MockState,
  enrollment: MockEnrollment,
  course: CourseSeed,
): Record<string, unknown> => {
  const lessons = allLessons(course);
  const rating = ratingOf(state, course.id);
  const done = enrollment.completedLessons.size;
  const dueMs = enrollment.dueDate === null ? null : Date.parse(enrollment.dueDate);
  const overdue =
    dueMs !== null && enrollment.status !== 15 && dueMs < state.now.getTime();
  const status = learningStatus(enrollment, overdue);
  return {
    id: course.id,
    slug: course.slug,
    assignmentId: enrollment.origin === 2 ? `asg-${enrollment.id}` : null,
    enrollmentId: enrollment.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    contentType: 0,
    contentTypeName: 'Course',
    origin: enrollment.origin,
    originName: enrollment.origin === 2 ? 'Assigned' : 'Self',
    assignedScope: enrollment.assignedScope,
    assignedScopeName: enrollment.assignedScope === 1 ? 'Me' : null,
    status,
    statusName: STATUS_NAMES[status],
    progress: lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100),
    dueDate: enrollment.dueDate,
    isOverdue: overdue,
    daysRemaining:
      dueMs === null ? null : Math.ceil((dueMs - state.now.getTime()) / DAY_MS),
    enrolledOrAssignedAt: enrollment.enrolledAt,
    lastAccessedAt: enrollment.lastAccessedAt,
    completedAt: enrollment.completedAt,
    totalLessons: lessons.length,
    completedLessons: done,
    durationSeconds: courseDurationSeconds(course),
    difficultyName: DIFFICULTY_NAMES[course.difficulty],
    categoryName: categoryNameOf(state, course),
    topic: null,
    thumbnailUrl: svgThumb(course.title, course.hue),
    certificateId: enrollment.status === 15 ? `cert-${enrollment.id}` : null,
    certificateUrl: null,
    isAccessible: true,
    isPublished: true,
    helpfulCount: course.helpfulCount,
    isHelpful: false,
    averageRating: rating.average,
    rating: rating.average,
    totalReviews: rating.total,
    actionLabel: ACTION_LABELS[status],
  };
};

interface CompletionContext {
  readonly state: MockState;
  readonly userId: string;
  readonly ref: CatalogRef;
  readonly completion: MockCompletion;
}

const toCompletionItem = ({
  state,
  userId,
  ref,
  completion,
}: CompletionContext): Record<string, unknown> => {
  const done = completion.at !== null;
  const total = state.tutorials.find((t) => t.id === ref.id)?.videos.length ?? 1;
  const rating = ratingOf(state, ref.id);
  const when = completion.at ?? state.now.toISOString();
  return {
    id: ref.id,
    slug: ref.slug,
    assignmentId: null,
    enrollmentId: null,
    title: ref.title,
    subtitle: ref.subtitle,
    description: ref.subtitle,
    contentType: ref.type,
    contentTypeName: ref.typeName,
    origin: 1,
    originName: 'Self',
    assignedScope: null,
    assignedScopeName: null,
    status: done ? 2 : 1,
    statusName: done ? 'Completed' : 'In Progress',
    progress: done ? 100 : Math.round((completion.videos.size / total) * 100),
    dueDate: null,
    isOverdue: false,
    daysRemaining: null,
    enrolledOrAssignedAt: when,
    lastAccessedAt: when,
    completedAt: completion.at,
    totalLessons: total,
    completedLessons: done ? total : completion.videos.size,
    durationSeconds: 0,
    difficultyName: 'Beginner',
    categoryName: categoryName(state, ref.categoryId),
    topic: null,
    thumbnailUrl: ref.thumbnailUrl,
    certificateId: done ? certificateIdFor(userId, ref.id) : null,
    certificateUrl: null,
    isAccessible: true,
    isPublished: true,
    helpfulCount: 0,
    isHelpful: false,
    averageRating: rating.average,
    rating: rating.average,
    totalReviews: rating.total,
    actionLabel: done ? 'View' : 'Continue',
  };
};

/** Tutorials and resources the learner has started or finished (they have no enrolment record). */
const completionItems = (state: MockState, userId: string): Record<string, unknown>[] => {
  const refs = catalogRefs(state);
  return [...state.completions].flatMap(([key, completion]) => {
    const [owner = '', contentId = ''] = key.split(':');
    const ref = refs.find((r) => r.id === contentId);
    return owner === userId && ref !== undefined && ref.type !== 0
      ? [toCompletionItem({ state, userId, ref, completion })]
      : [];
  });
};

const itemsFor = (state: MockState, userId: string): Record<string, unknown>[] => [
  ...courseItems(state, userId),
  ...completionItems(state, userId),
];

const courseItems = (state: MockState, userId: string): Record<string, unknown>[] =>
  state.enrollments
    .filter((e) => e.userId === userId)
    .flatMap((enrollment) => {
      const course = state.courses.find((c) => c.id === enrollment.courseId);
      return course === undefined ? [] : [toItem(state, enrollment, course)];
    });

const numberQuery = (value: string | undefined): number | undefined =>
  value === undefined || value === '' ? undefined : Number(value);

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

interface LearningFilters {
  readonly filter: string;
  readonly origin: number | undefined;
  readonly status: number | undefined;
  readonly contentType: number | undefined;
}

const matchesLearningFilters = (
  item: Record<string, unknown>,
  f: LearningFilters,
): boolean =>
  text(item.title).toLowerCase().includes(f.filter.toLowerCase()) &&
  (f.origin === undefined || item.origin === f.origin) &&
  (f.status === undefined || item.status === f.status) &&
  (f.contentType === undefined || item.contentType === f.contentType);

const SORTERS = {
  title: (i: Record<string, unknown>): string => text(i.title),
  progress: (i: Record<string, unknown>): number => Number(i.progress),
  duedate: (i: Record<string, unknown>): string => text(i.dueDate) || '9999',
  lastaccessedat: (i: Record<string, unknown>): string => text(i.lastAccessedAt),
  enrolledorassignedat: (i: Record<string, unknown>): string =>
    text(i.enrolledOrAssignedAt),
} as const;

export const myLearningHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: `${BASE}/my-learning`,
    handler: (request) => {
      const { filter = '', sorting } = request.query;
      const matches = itemsFor(state, requireUser(request).id).filter((item) =>
        matchesLearningFilters(item, {
          filter,
          origin: numberQuery(request.query.origin),
          status: numberQuery(request.query.status),
          contentType: numberQuery(request.query.contentType),
        }),
      );
      return paginate(sortBy(matches, sorting, SORTERS), request.query);
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/stats`,
    handler: (request) => {
      const items = itemsFor(state, requireUser(request).id);
      const assigned = items.filter((i) => i.origin === 2);
      const count = (status: number): number =>
        items.filter((i) => i.status === status).length;
      return {
        totalCount: items.length,
        selfCount: items.length - assigned.length,
        assignedCount: assigned.length,
        assignedMeCount: assigned.filter((i) => i.assignedScope === 1).length,
        assignedTeamCount: assigned.filter((i) => i.assignedScope === 2).length,
        assignedRoleCount: assigned.filter((i) => i.assignedScope === 3).length,
        inProgressCount: count(1),
        completedCount: count(2),
        overdueCount: count(3),
      };
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/my-enrollments`,
    handler: (request) => {
      const user = requireUser(request);
      const { filter = '', sorting } = request.query;
      const status = numberQuery(request.query.status);
      const courses = state.enrollments
        .filter(
          (e) => e.userId === user.id && (status === undefined || e.status === status),
        )
        .flatMap((e) => state.courses.filter((c) => c.id === e.courseId))
        .filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()));
      const page = paginate(
        sortBy(courses, sorting, { title: (c) => c.title }),
        request.query,
      );
      return {
        items: page.items.map((c) => toCourseRow(state, c, user)),
        totalCount: page.totalCount,
      };
    },
  },
];
