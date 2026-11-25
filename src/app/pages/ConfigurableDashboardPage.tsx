import type { ReactElement } from 'react';
import { useMyCapabilities } from '@features/users';
import { DynamicDashboard } from '@features/dashboard';
import { WelcomeHero } from './DashboardParts';
import { useDashboardContext } from './use-dashboard-context';
import styles from './ConfigurableDashboardPage.module.css';

/**
 * Dynamic configurable analytics dashboard with welcome hero.
 */
export const ConfigurableDashboardPage = (): ReactElement => {
  const { name, subtitle } = useDashboardContext();
  const { can } = useMyCapabilities();

  const canEdit = can('dashboard', 'manage');

  return (
    <main className={styles.screen}>
      <WelcomeHero name={name} subtitle={subtitle} className={styles.heroRow} />
      <DynamicDashboard canEdit={canEdit} />
    </main>
  );
};
