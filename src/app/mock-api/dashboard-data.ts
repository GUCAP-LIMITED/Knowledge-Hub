import { categoryNameOf } from './course-view';
import type { MockState } from './mock-state';
import type { MockUser } from './seed/mock-users';
import { findWidget, type WidgetDefinition } from './seed/widget-catalog';

interface Point {
  readonly label: string;
  readonly value: number;
  readonly meta?: string;
}

interface WidgetResult {
  readonly value?: number;
  readonly delta?: number;
  readonly series?: readonly Point[];
  readonly summary?: string;
}

const scoped = (
  state: MockState,
  user: MockUser,
  global: boolean,
): typeof state.enrollments =>
  global ? state.enrollments : state.enrollments.filter((e) => e.userId === user.id);

const isOverdue = (state: MockState, e: MockState['enrollments'][number]): boolean =>
  e.status !== 15 && e.dueDate !== null && Date.parse(e.dueDate) < state.now.getTime();

const completionByCategory = (
  state: MockState,
  rows: typeof state.enrollments,
): Point[] =>
  [...new Set(state.courses.map((c) => categoryNameOf(state, c)))].map((name) => {
    const inCategory = rows.filter((e) => {
      const course = state.courses.find((c) => c.id === e.courseId);
      return course !== undefined && categoryNameOf(state, course) === name;
    });
    const done = inCategory.filter((e) => e.status === 15).length;
    return {
      label: name,
      value: inCategory.length === 0 ? 0 : Math.round((done / inCategory.length) * 100),
    };
  });

const topRated = (state: MockState): Point[] =>
  [...state.courses]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map((course) => ({
      label: course.title,
      value: course.rating,
      meta: JSON.stringify({
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        rating: course.rating.toFixed(1),
        reviewsCount: String(course.totalReviews),
      }),
    }));

const recentNotifications = (
  state: MockState,
  user: MockUser,
  max: number,
): WidgetResult => {
  const mine = state.notifications.filter((n) => n.userId === user.id);
  const unread = mine.filter((n) => !n.isRead).length;
  return {
    series: mine.slice(0, max).map((n) => ({
      label: n.title,
      value: n.isRead ? 0 : 1,
      meta: JSON.stringify({
        id: n.id,
        message: n.message,
        priorityName: n.priorityName,
        topicId: n.topicId,
        isRead: n.isRead,
        creationTime: n.creationTime,
      }),
    })),
    summary: JSON.stringify({
      periodTotal: mine.length,
      periodUnread: unread,
      totalUnread: unread,
    }),
  };
};

const leaderboard = (state: MockState): Point[] => {
  const byUser = new Map<string, number>();
  for (const e of state.enrollments.filter((x) => x.status === 15)) {
    byUser.set(e.userId, (byUser.get(e.userId) ?? 0) + 1);
  }
  const names: Record<string, string> = {
    'user-admin': 'Amelia Hart',
    'user-manager': 'Daniel Okafor',
    'user-consultant': 'Priya Nair',
  };
  return [...byUser]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ label: names[id] ?? id, value: count }));
};

const compute = (
  state: MockState,
  user: MockUser,
  widget: WidgetDefinition,
  config: Record<string, unknown>,
): WidgetResult => {
  const global = user.dataScope >= 10;
  const rows = scoped(state, user, global);
  switch (widget.key) {
    case 'courses.active':
      return { value: rows.filter((e) => e.status === 5).length, delta: 2 };
    case 'courses.completed':
      return { value: rows.filter((e) => e.status === 15).length, delta: 1 };
    case 'learning.overdue':
      return { value: rows.filter((e) => isOverdue(state, e)).length, delta: 0 };
    case 'quizzes.pending':
      return { value: 3, delta: -1 };
    case 'courses.overview':
      return { series: completionByCategory(state, rows) };
    case 'courses.top-rated':
      return { series: topRated(state) };
    case 'quizzes.scores':
      return {
        series: completionByCategory(state, rows).map((p) => ({
          ...p,
          value: 60 + (p.value % 35),
        })),
      };
    case 'learners.progress':
      return { series: leaderboard(state) };
    case 'certifications.funnel': {
      const total = rows.length;
      const started = rows.filter((e) => e.completedLessons.size > 0).length;
      return {
        series: [
          { label: 'Enrolled', value: total },
          { label: 'Started', value: started },
          { label: 'Completed', value: rows.filter((e) => e.status === 15).length },
          { label: 'Certified', value: rows.filter((e) => e.status === 15).length },
        ],
      };
    }
    case 'notifications.recent':
      return recentNotifications(state, user, Number(config.maxCount ?? 5));
    default:
      return {};
  }
};

export const buildWidgetData = (
  state: MockState,
  user: MockUser,
  widgetKey: string,
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const widget = findWidget(widgetKey);
  if (widget === undefined) {
    return { widgetKey, kind: 0, series: [] };
  }
  const result = compute(state, user, widget, config);
  const isAction = widget.key.startsWith('action.');
  return {
    widgetKey,
    kind: widget.kind,
    title: widget.displayName,
    description: isAction ? 'Open view' : null,
    route: widget.route ?? null,
    value: result.value ?? null,
    delta: result.delta ?? null,
    series: result.series ?? [],
    summary: result.summary ?? null,
  };
};
