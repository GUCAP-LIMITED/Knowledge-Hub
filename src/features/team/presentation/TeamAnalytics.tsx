import type { ReactElement } from 'react';
import type { TeamMember } from '../domain';
import { AreaChart, Gauge } from './AnalyticsCharts';
import { monthlyCounts, percentage } from './team-analytics-data';
import styles from './TeamAnalytics.module.css';

export interface TeamAnalyticsProps {
  readonly members: readonly TeamMember[];
  readonly teamTotalCourses: number;
  readonly teamCompletedCourses: number;
  readonly certificatesEarnedDates: readonly Date[];
}

/**
 * Team analytics: a real certificate-issuance trend (bucketed from issue dates) and a
 * course-completion gauge (completed vs assigned across the team). Hand-rolled SVG — no chart
 * dependency. The parent already covers headline numbers as stat cards, so this stays visual.
 */
export const TeamAnalytics = ({
  members,
  teamTotalCourses,
  teamCompletedCourses,
  certificatesEarnedDates,
}: TeamAnalyticsProps): ReactElement | null => {
  if (members.length === 0 && certificatesEarnedDates.length === 0) {
    return null;
  }

  const now = new Date();
  const trend = monthlyCounts(certificatesEarnedDates, now, 6);
  const earnedRecently = trend.reduce((sum, point) => sum + point.value, 0);
  const completionRate = percentage(teamCompletedCourses, teamTotalCourses);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardLabel}>Certificates earned</span>
          <span className={styles.cardValue}>
            {earnedRecently} <small>last 6 months</small>
          </span>
        </div>
        <AreaChart points={trend} />
      </div>
      <div className={styles.card}>
        <span className={styles.cardLabel}>Courses completed</span>
        <Gauge
          value={completionRate}
          caption={`${String(teamCompletedCourses)} of ${String(teamTotalCourses)} team courses completed`}
        />
      </div>
    </div>
  );
};
