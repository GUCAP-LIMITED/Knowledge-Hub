import { beforeAll, describe, expect, it } from 'vitest';
import { SystemClock } from '@core/time';
import { createCoursesModule } from '@features/courses';
import { createDashboardModule } from '@features/dashboard';
import { createMyLearningModule } from '@features/my-learning';
import { createNotificationsModule } from '@features/notifications';
import { createPlaybackModule } from '@features/playback';
import { createSearchModule } from '@features/search';
import { silentLogger } from '@testing';
import { MockHttpClient } from './mock-http-client';
import { buildMockRoutes } from './mock-routes';
import { createMockState } from './mock-state';
import { issueAccessToken } from './seed/mock-tokens';
import { findMockUser } from './seed/mock-users';

interface Modules {
  readonly courses: ReturnType<typeof createCoursesModule>;
  readonly myLearning: ReturnType<typeof createMyLearningModule>;
  readonly notifications: ReturnType<typeof createNotificationsModule>;
  readonly dashboard: ReturnType<typeof createDashboardModule>;
  readonly search: ReturnType<typeof createSearchModule>;
  readonly playback: ReturnType<typeof createPlaybackModule>;
}

/**
 * Contract tests: the REAL feature gateways (Zod DTOs + mappers) run against the mock backend, so a
 * seed that drifts from the wire contract fails here instead of as a blank page.
 */
const setup = (userId: string): Modules => {
  const user = findMockUser(userId);
  if (user === undefined) {
    throw new Error(`Unknown demo user ${userId}`);
  }
  const clock = new SystemClock();
  const token = issueAccessToken(user, clock.now().getTime());
  return buildModules(token, clock);
};

const buildModules = (token: string, clock: SystemClock): Modules => {
  const logger = silentLogger();
  const httpClient = new MockHttpClient({
    routes: buildMockRoutes({ state: createMockState(clock.now()), clock }),
    logger,
    getAuthToken: () => token,
    latencyMs: 0,
  });
  return {
    courses: createCoursesModule({ httpClient, logger }),
    myLearning: createMyLearningModule({ httpClient, logger }),
    notifications: createNotificationsModule({ httpClient, logger }),
    dashboard: createDashboardModule({ httpClient, logger }),
    search: createSearchModule({ httpClient, logger }),
    playback: createPlaybackModule({ httpClient }),
  };
};

describe('mock API contract (learner core)', () => {
  let m: Modules;
  beforeAll(() => {
    m = setup('user-consultant');
  });

  it('lists the course catalogue and filters by text', async () => {
    const all = await m.courses.listCourses.execute({});
    expect(all.ok && all.value.totalCount).toBeGreaterThanOrEqual(7);
    const filtered = await m.courses.listCourses.execute({ filter: 'admissions' });
    expect(
      filtered.ok &&
        filtered.value.items.every((c) => /admissions/i.test(c.title + c.category)),
    ).toBe(true);
  });

  it('returns a course with its curriculum and learner progress', async () => {
    const result = await m.courses.getCourse.execute('course-admissions');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isEnrolled).toBe(true);
      expect(result.value.sections.length).toBeGreaterThan(0);
      expect(result.value.progress).toBeGreaterThan(0);
    }
  });

  it('completes a course lesson by lesson and issues a certificate id', async () => {
    const first = await m.courses.getCourse.execute('course-communication');
    if (!first.ok || first.value.enrollmentId === null) throw new Error('seed missing');
    const { enrollmentId, sections } = first.value;
    let last = await m.courses.getCourse.execute('course-communication');
    for (const lesson of sections.flatMap((s) => s.lessons)) {
      last = await m.courses.markLessonComplete.execute(
        'course-communication',
        enrollmentId,
        lesson.id,
      );
    }
    expect(last.ok && last.value.isCompleted()).toBe(true);
    expect(last.ok && last.value.certificateId).not.toBeNull();
  });

  it('enrolls in a course that the learner has not joined', async () => {
    const result = await m.courses.enrollCourse.execute('course-support');
    expect(result.ok && result.value.isEnrolled).toBe(true);
  });

  it('summarises my learning with an overdue assignment', async () => {
    const items = await m.myLearning.getMyLearning.execute({
      skipCount: 0,
      maxResultCount: 20,
    });
    expect(items.ok && items.value.totalCount).toBeGreaterThanOrEqual(3);
    const stats = await m.myLearning.getMyLearningStats.execute();
    expect(stats.ok && stats.value.overdueCount).toBeGreaterThanOrEqual(1);
  });

  it('serves the signed-in user dashboard and widget data', async () => {
    const dashboard = await m.dashboard.getMyDashboard.execute();
    expect(dashboard.ok && dashboard.value?.widgets.length).toBeGreaterThan(0);
    const data = await m.dashboard.getWidgetData.execute({
      widgetKey: 'courses.active',
      config: null,
      period: 'thisMonth',
    });
    expect(data.ok && data.value.value).not.toBeNull();
  });

  it('lists, counts and clears notifications', async () => {
    const list = await m.notifications.listAnnouncements.execute();
    expect(list.ok && list.value.length).toBeGreaterThan(0);
    const stats = await m.notifications.getNotificationStats.execute();
    expect(stats.ok && stats.value.unreadCount).toBeGreaterThan(0);
    await m.notifications.markAllRead.execute();
    const after = await m.notifications.getNotificationStats.execute();
    expect(after.ok && after.value.unreadCount).toBe(0);
  });

  it('finds courses by search term and resolves playback URLs', async () => {
    const found = await m.search.searchContent.execute({ query: 'welcome' });
    expect(found.ok && found.value.courses.length).toBeGreaterThan(0);
    const url = await m.playback.getPlaybackUrl.execute('asset-vid-1');
    expect(url.ok && url.value.url).toMatch(/^https?:\/\//);
  });
});
