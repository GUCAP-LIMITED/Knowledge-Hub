import type { ReactElement } from 'react';
import { useMyCapabilities } from '@features/users';
import { PageHeader } from '@shared/ui';
import { DynamicDashboard } from './components/DynamicDashboard';
import styles from './DashboardPage.module.css';

/**
 * Dynamic configurable dashboard: renders the caller's resolved dashboard (personal → user-type template →
 * tenant default) or user-type templates for administrators.
 */
export const DashboardPage = (): ReactElement => {
  const { can } = useMyCapabilities();
  const canManageDashboard = can('dashboard', 'manage');

  return (
    <main className={styles.screen}>
      <PageHeader
        title="Dashboard"
        subtitle="Performance metrics and activity insights."
      />
      <DynamicDashboard canEdit={canManageDashboard} />
    </main>
  );
};
