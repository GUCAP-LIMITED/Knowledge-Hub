import type { ReactElement } from 'react';
import { useAuth, type AuthenticatedUser } from '@features/auth';
import { useCourses } from '@features/courses';
import { useCertificates } from '@features/certificates';
import { useSubmissions } from '@features/submissions';
import { useBranchUsers } from '@features/users';
import { useAnnouncements, useMarkAllRead } from '@features/notifications';
import {
  AnnouncementsCard,
  ContinueLearningCard,
  QuickActions,
  StatsGrid,
  WelcomeHero,
} from './DashboardParts';
import { buildActions, buildStats, type DashCtx, type Role } from './dashboard-data';
import { OnboardingChecklist } from './OnboardingChecklist';
import styles from './DashboardPage.module.css';

const roleOf = (user: AuthenticatedUser | null): Role => {
  if (user?.hasRole('admin') === true) {
    return 'admin';
  }
  return user?.hasRole('manager') === true ? 'manager' : 'consultant';
};

const subtitleFor = (role: Role, ctx: DashCtx): string => {
  if (role === 'admin') {
    return `You have ${String(ctx.pending)} item${ctx.pending === 1 ? '' : 's'} awaiting review.`;
  }
  if (ctx.continueTitle !== null) {
    return `Pick up where you left off — “${ctx.continueTitle}”.`;
  }
  return 'No active courses. Browse the catalog to start learning.';
};

const renderOnboarding = (
  role: Role,
  user: AuthenticatedUser | null,
  ctx: DashCtx,
): ReactElement | null =>
  role === 'admin' ? null : (
    <OnboardingChecklist
      userId={user?.id ?? 'guest'}
      started={ctx.inProgressCount > 0 || ctx.completedCount > 0}
      completed={ctx.completedCount > 0}
      certified={ctx.certCount > 0}
    />
  );

/** Role-aware home dashboard: hero, quick actions, stats, continue-learning + announcements. */
export const DashboardPage = (): ReactElement => {
  const { user } = useAuth();
  const role = roleOf(user);
  const courses = useCourses();
  const certificates = useCertificates();
  const submissions = useSubmissions();
  // The user count is an admin-only stat; only admins may list branch users, so gate the fetch.
  const users = useBranchUsers(null, role === 'admin');
  const announcements = useAnnouncements();
  const markAll = useMarkAllRead();
  const list = courses.data ?? [];
  const inProgress = list.filter(
    (course) => course.hasStarted() && !course.isCompleted(),
  );
  const subs = submissions.data ?? [];
  const ann = announcements.data ?? [];

  const ctx: DashCtx = {
    pending: subs.filter((s) => s.awaitsDecision()).length,
    coursesCount: list.length,
    completedCount: list.filter((c) => c.isCompleted()).length,
    inProgressCount: inProgress.length,
    certCount: (certificates.data ?? []).length,
    submissionsCount: subs.length,
    publishedCount: subs.filter((s) => s.status === 'published').length,
    rejectedCount: subs.filter((s) => s.status === 'rejected').length,
    usersCount: (users.data ?? []).length,
    continueTitle: inProgress[0]?.title ?? null,
  };
  const firstName = (user?.fullName ?? 'there').split(' ')[0] ?? 'there';

  return (
    <section className={styles.screen}>
      <WelcomeHero firstName={firstName} subtitle={subtitleFor(role, ctx)} />
      {renderOnboarding(role, user, ctx)}
      <QuickActions actions={buildActions(role, ctx)} />
      <StatsGrid stats={buildStats(role, ctx)} />
      <div className={styles.twoCol}>
        <ContinueLearningCard courses={inProgress} />
        <AnnouncementsCard
          announcements={ann}
          unread={ann.filter((a) => a.isUnread()).length}
          onMarkAll={() => {
            markAll.mutate();
          }}
        />
      </div>
    </section>
  );
};
