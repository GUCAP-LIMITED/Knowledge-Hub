import type { ReactElement } from 'react';
import { useAuth, type AuthenticatedUser } from '@features/auth';
import { useCourses, type Course } from '@features/courses';
import { useCertificates } from '@features/certificates';
import { useSubmissions, type Submission } from '@features/submissions';
import { useUsers } from '@features/users';
import { useAnnouncements, useMarkAllRead } from '@features/notifications';
import {
  GreetingBar,
  KpiStrip,
  KpiStripSkeleton,
  QuickActionsRail,
} from './DashboardParts';
import {
  AnnouncementsCard,
  AttentionCard,
  ContinueLearningCard,
  PanelSkeleton,
} from './DashboardPanels';
import {
  buildActions,
  buildGreetingCta,
  buildKpis,
  type DashCtx,
  type Role,
} from './dashboard-data';
import styles from './DashboardPage.module.css';

const roleOf = (user: AuthenticatedUser | null): Role => {
  if (user?.hasRole('admin') === true) {
    return 'admin';
  }
  return user?.hasRole('manager') === true ? 'manager' : 'consultant';
};

interface Derived {
  readonly ctx: DashCtx;
  readonly inProgress: readonly Course[];
  readonly pendingSubs: readonly Submission[];
}

const deriveDashboard = (
  courses: readonly Course[],
  subs: readonly Submission[],
  certCount: number,
  usersCount: number,
): Derived => {
  const inProgress = courses.filter((c) => c.hasStarted() && !c.isCompleted());
  const pendingSubs = subs.filter((s) => s.status === 'pending');
  const ctx: DashCtx = {
    pending: pendingSubs.length,
    coursesCount: courses.length,
    completedCount: courses.filter((c) => c.isCompleted()).length,
    inProgressCount: inProgress.length,
    certCount,
    submissionsCount: subs.length,
    publishedCount: subs.filter((s) => s.status === 'published').length,
    rejectedCount: subs.filter((s) => s.status === 'rejected').length,
    usersCount,
    continueTitle: inProgress[0]?.title ?? null,
  };
  return { ctx, inProgress, pendingSubs };
};

const subtitleFor = (role: Role, ctx: DashCtx): string => {
  if (role === 'admin') {
    return ctx.pending > 0
      ? `${String(ctx.pending)} submission${ctx.pending === 1 ? '' : 's'} awaiting your review.`
      : 'Everything is reviewed — here is how your programme is doing.';
  }
  if (ctx.continueTitle !== null) {
    return `Pick up where you left off — “${ctx.continueTitle}”.`;
  }
  return 'No active courses. Browse the catalog to start learning.';
};

const FocalBlock = ({
  role,
  loading,
  pendingSubs,
  inProgress,
}: {
  readonly role: Role;
  readonly loading: boolean;
  readonly pendingSubs: readonly Submission[];
  readonly inProgress: readonly Course[];
}): ReactElement => {
  if (loading) {
    return <PanelSkeleton rows={4} />;
  }
  if (role === 'admin') {
    return <AttentionCard pending={pendingSubs} />;
  }
  return <ContinueLearningCard courses={inProgress} />;
};

const KpiBlock = ({
  loading,
  role,
  ctx,
}: {
  readonly loading: boolean;
  readonly role: Role;
  readonly ctx: DashCtx;
}): ReactElement =>
  loading ? <KpiStripSkeleton /> : <KpiStrip kpis={buildKpis(role, ctx)} />;

/** Role-aware home: greeting + KPIs, then a focal work block beside announcements & actions. */
export const DashboardPage = (): ReactElement => {
  const { user } = useAuth();
  const courses = useCourses();
  const certificates = useCertificates();
  const submissions = useSubmissions();
  const users = useUsers();
  const announcements = useAnnouncements();
  const markAll = useMarkAllRead();

  const role = roleOf(user);
  const ann = announcements.data ?? [];
  const { ctx, inProgress, pendingSubs } = deriveDashboard(
    courses.data ?? [],
    submissions.data ?? [],
    (certificates.data ?? []).length,
    (users.data ?? []).length,
  );
  const firstName = (user?.fullName ?? 'there').split(' ')[0] ?? 'there';
  const kpisLoading =
    courses.isLoading || submissions.isLoading || certificates.isLoading;
  const focalLoading = role === 'admin' ? submissions.isLoading : courses.isLoading;

  return (
    <section className={styles.screen}>
      <GreetingBar
        firstName={firstName}
        subtitle={subtitleFor(role, ctx)}
        cta={buildGreetingCta(role, ctx)}
      />

      <KpiBlock loading={kpisLoading} role={role} ctx={ctx} />

      <div className={styles.twoCol}>
        <FocalBlock
          role={role}
          loading={focalLoading}
          pendingSubs={pendingSubs}
          inProgress={inProgress}
        />

        <div className={styles.rail}>
          <AnnouncementsCard
            announcements={ann}
            unread={ann.filter((a) => a.isUnread()).length}
            onMarkAll={() => {
              markAll.mutate();
            }}
          />
          <QuickActionsRail actions={buildActions(role, ctx)} />
        </div>
      </div>
    </section>
  );
};
