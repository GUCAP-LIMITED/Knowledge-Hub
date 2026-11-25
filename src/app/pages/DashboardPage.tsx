import type { ReactElement } from 'react';
import type { AuthenticatedUser } from '@features/auth';
import {
  AnnouncementsCard,
  ContinueLearningCard,
  QuickActions,
  StatsGrid,
  WelcomeHero,
} from './DashboardParts';
import { buildActions, buildStats, type DashCtx, type Role } from './dashboard-data';
import { OnboardingChecklist } from './OnboardingChecklist';
import { useDashboardContext } from './use-dashboard-context';
import styles from './DashboardPage.module.css';

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
  const { user, role, name, ctx, subtitle, inProgress, announcements, markAll } =
    useDashboardContext();

  return (
    <section className={styles.screen}>
      <WelcomeHero name={name} subtitle={subtitle} />
      {renderOnboarding(role, user, ctx)}
      <QuickActions actions={buildActions(role, ctx)} />
      <StatsGrid stats={buildStats(role, ctx)} />
      <div className={styles.twoCol}>
        <ContinueLearningCard courses={inProgress} />
        <AnnouncementsCard
          announcements={announcements}
          unread={announcements.filter((a) => a.isUnread()).length}
          onMarkAll={() => {
            markAll.mutate();
          }}
        />
      </div>
    </section>
  );
};
