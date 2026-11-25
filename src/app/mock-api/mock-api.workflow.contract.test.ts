import { describe, expect, it } from 'vitest';
import { SystemClock } from '@core/time';
import { createAssignmentsModule } from '@features/assignments';
import { createCertificatesModule } from '@features/certificates';
import { createContentModule } from '@features/content';
import { createCoursesModule } from '@features/courses';
import { createCourseReviewsModule } from '@features/course-reviews';
import { createEmailTemplatesModule } from '@features/email-templates';
import { createPermissionsModule } from '@features/permissions';
import { createQuizzesModule } from '@features/quizzes';
import { createResourcesModule } from '@features/resources';
import { createSubmissionsModule } from '@features/submissions';
import { createTeamModule } from '@features/team';
import { createTeamsModule } from '@features/teams';
import { createTutorialsModule } from '@features/tutorials';
import { createUserTypesModule } from '@features/user-types';
import { silentLogger } from '@testing';
import { MockHttpClient } from './mock-http-client';
import { buildMockRoutes } from './mock-routes';
import { createMockState } from './mock-state';
import { issueAccessToken } from './seed/mock-tokens';
import { findMockUser } from './seed/mock-users';

/**
 * Contract tests for everything beyond the learner core: the REAL gateways (Zod DTOs + mappers)
 * run against the mock backend for tutorials, resources, quizzes, certificates, reviews, the
 * approval workflow, team tooling and administration.
 */
interface Connected {
  readonly tutorials: ReturnType<typeof createTutorialsModule>;
  readonly resources: ReturnType<typeof createResourcesModule>;
  readonly quizzes: ReturnType<typeof createQuizzesModule>;
  readonly certificates: ReturnType<typeof createCertificatesModule>;
  readonly reviews: ReturnType<typeof createCourseReviewsModule>;
  readonly team: ReturnType<typeof createTeamModule>;
  readonly teams: ReturnType<typeof createTeamsModule>;
  readonly assignments: ReturnType<typeof createAssignmentsModule>;
  readonly permissions: ReturnType<typeof createPermissionsModule>;
  readonly userTypes: ReturnType<typeof createUserTypesModule>;
  readonly submissions: ReturnType<typeof createSubmissionsModule>;
  readonly content: ReturnType<typeof createContentModule>;
  readonly courses: ReturnType<typeof createCoursesModule>;
  readonly emailTemplates: ReturnType<typeof createEmailTemplatesModule>;
}

const connect = (userId: string): Connected => {
  const user = findMockUser(userId);
  if (user === undefined) throw new Error(`Unknown demo user ${userId}`);
  const clock = new SystemClock();
  const token = issueAccessToken(user, clock.now().getTime());
  const logger = silentLogger();
  const httpClient = new MockHttpClient({
    routes: buildMockRoutes({ state: createMockState(clock.now()), clock }),
    logger,
    getAuthToken: () => token,
    latencyMs: 0,
  });
  return modules(httpClient, logger, clock);
};

const modules = (
  httpClient: MockHttpClient,
  logger: ReturnType<typeof silentLogger>,
  clock: SystemClock,
): Connected => ({
  tutorials: createTutorialsModule({ httpClient, logger }),
  resources: createResourcesModule({ httpClient, logger }),
  quizzes: createQuizzesModule({ httpClient, logger }),
  certificates: createCertificatesModule({ httpClient, logger, clock }),
  reviews: createCourseReviewsModule({ httpClient, logger, clock }),
  team: createTeamModule({ httpClient, logger }),
  teams: createTeamsModule({ httpClient, logger }),
  assignments: createAssignmentsModule({ httpClient, logger }),
  permissions: createPermissionsModule({ httpClient, logger }),
  userTypes: createUserTypesModule({ httpClient, logger }),
  submissions: createSubmissionsModule({ httpClient, logger }),
  content: createContentModule({ httpClient, logger }),
  courses: createCoursesModule({ httpClient, logger }),
  emailTemplates: createEmailTemplatesModule({ httpClient, logger }),
});

describe('mock API contract (content, workflow, admin)', () => {
  it('serves tutorials and tracks video progress to completion', async () => {
    const m = connect('user-consultant');
    const list = await m.tutorials.listTutorials.execute();
    expect(list.ok && list.value.totalCount).toBeGreaterThanOrEqual(5);
    const first = await m.tutorials.markVideoComplete.execute(
      'tut-gdpr-quickstart',
      'asset-vid-3',
    );
    expect(first.ok && first.value.isCompleted()).toBe(true);
  });

  it('serves resources with their files and category stats', async () => {
    const m = connect('user-consultant');
    const list = await m.resources.listResources.execute();
    expect(list.ok && list.value.items.length).toBeGreaterThan(0);
    const stats = await m.resources.getResourceStats.execute();
    expect(stats.ok && stats.value.totalCount).toBeGreaterThan(0);
  });

  it('scores a quiz and records the attempt', async () => {
    const m = connect('user-consultant');
    const quizzes = await m.quizzes.listQuizzes.execute('quiz-1');
    if (!quizzes.ok || quizzes.value[0] === undefined) throw new Error('quiz missing');
    const quiz = quizzes.value[0];
    const answers = Object.fromEntries(quiz.questions.map((q) => [q.id, [0]]));
    const result = await m.quizzes.submitQuiz.execute(quiz.id, answers);
    expect(result.ok).toBe(true);
    const status = await m.quizzes.getMyQuizStatus.execute(quiz.id);
    expect(status.ok && status.value.attemptCount).toBe(1);
  });

  it('completes the course lesson when its quiz is passed', async () => {
    const m = connect('user-manager');
    const quizzes = await m.quizzes.listQuizzes.execute('quiz-3');
    if (!quizzes.ok || quizzes.value[0] === undefined) throw new Error('quiz missing');
    const quiz = quizzes.value[0];
    const answers = Object.fromEntries(
      quiz.questions.map((q) => [q.id, [...q.correctIndexes]]),
    );
    const result = await m.quizzes.submitQuiz.execute(quiz.id, answers);
    expect(result.ok && result.value.passed).toBe(true);
    const course = await m.courses.getCourse.execute('course-compliance');
    expect(course.ok && course.value.completedLessons).toContain('les-c-4');
  });

  it('lists certificates for completed learning', async () => {
    const m = connect('user-consultant');
    const list = await m.certificates.listCertificates.execute({ isSelf: true });
    expect(list.ok && list.value.items.length).toBeGreaterThan(0);
    const first = list.ok ? list.value.items[0] : undefined;
    const one = await m.certificates.getCertificate.execute(first?.id ?? '');
    expect(one.ok).toBe(true);
  });

  it('lists reviews and review statistics', async () => {
    const m = connect('user-admin');
    const reviews = await m.reviews.getReviews.execute({ maxResultCount: 10 });
    expect(reviews.ok && reviews.value.totalCount).toBeGreaterThan(0);
    const stats = await m.reviews.getCourseStatistics.execute();
    expect(stats.ok && stats.value.totalReviews).toBeGreaterThan(0);
  });

  it('runs a submission through approve and publish into the catalogue', async () => {
    const admin = connect('user-admin');
    const queue = await admin.submissions.listSubmissions.execute();
    expect(queue.ok && queue.value.some((s) => s.status === 'pending')).toBe(true);
    const approved = await admin.submissions.approveSubmission.execute(
      'sub-visa',
      'Looks good',
    );
    expect(approved.ok).toBe(true);
    const published = await admin.submissions.publishSubmission.execute('sub-visa');
    expect(published.ok && published.value.status).toBe('published');
  });

  it('shows team progress, assigns training and lists teams to a manager', async () => {
    const m = connect('user-manager');
    const overview = await m.team.getTeamProgressOverview.execute();
    expect(overview.ok && overview.value.totalMembers).toBeGreaterThan(0);
    const assignments = await m.assignments.listAssignments.execute();
    expect(assignments.ok && assignments.value.totalCount).toBeGreaterThan(0);
  });

  it('administers permission sets, user types and email templates', async () => {
    const m = connect('user-admin');
    const sets = await m.permissions.listPermissionSets.execute();
    expect(sets.ok && sets.value.length).toBeGreaterThanOrEqual(3);
    const types = await m.userTypes.listUserTypes.execute();
    expect(types.ok && types.value.length).toBeGreaterThanOrEqual(4);
    const templates = await m.emailTemplates.gateway.getList();
    expect(templates.ok && templates.value.length).toBeGreaterThan(0);
  });

  it('exposes content records to the editor', async () => {
    const m = connect('user-admin');
    const detail = await m.content.gateway.get('course-welcome');
    expect(detail.sections.length).toBeGreaterThan(0);
    const page = await m.content.gateway.list({ maxResultCount: 50 });
    expect(page.totalCount).toBeGreaterThan(10);
  });
});
