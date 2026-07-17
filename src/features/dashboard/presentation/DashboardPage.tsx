import { type ReactElement, useState } from 'react';
import { Alert, Button, EmptyState, PageHeader, Select, Spinner } from '@shared/ui';
import type { DashboardPeriod } from '../domain';
import { WidgetTile } from './WidgetTile';
import { useMyDashboard, useResetMyDashboard } from './use-dashboard';
import styles from './DashboardPage.module.css';

const PERIODS: readonly { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'thisYear', label: 'This year' },
];

function toPeriod(value: string): DashboardPeriod {
  const match = PERIODS.find((period) => period.value === value);
  return match?.value ?? 'thisMonth';
}

/**
 * Configurable dashboard: renders the caller's resolved dashboard (personal → user-type template →
 * tenant default), each widget fetching its own data. Backed by `/api/app/dashboard`.
 */
export const DashboardPage = (): ReactElement => {
  const dashboard = useMyDashboard();
  const resetDashboard = useResetMyDashboard();
  const [period, setPeriod] = useState<DashboardPeriod>('thisMonth');

  return (
    <main className={styles.screen}>
      <PageHeader title="Dashboard" subtitle="Your configurable widget dashboard." />

      <div className={styles.toolbar}>
        <div className={styles.grow}>
          <Select
            label="Period"
            value={period}
            onChange={(event) => {
              setPeriod(toPeriod(event.target.value));
            }}
          >
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="secondary"
          isLoading={resetDashboard.isPending}
          onClick={() => {
            resetDashboard.mutate();
          }}
        >
          Reset to default
        </Button>
      </div>

      {dashboard.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading dashboard" />
        </div>
      ) : null}

      {dashboard.isError ? (
        <Alert tone="error" title="Could not load dashboard">
          {dashboard.error.message}
        </Alert>
      ) : null}

      {dashboard.isSuccess &&
      (dashboard.data === null || dashboard.data.widgets.length === 0) ? (
        <EmptyState
          title="No widgets yet"
          description="No dashboard is configured for your role."
        />
      ) : null}

      {dashboard.isSuccess &&
      dashboard.data !== null &&
      dashboard.data.widgets.length > 0 ? (
        <div className={styles.grid}>
          {dashboard.data.widgets.map((widget) => (
            <WidgetTile key={widget.id} widget={widget} period={period} />
          ))}
        </div>
      ) : null}
    </main>
  );
};
