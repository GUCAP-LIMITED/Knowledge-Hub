import type { ReactElement } from 'react';
import { useCertificates } from '@features/certificates';
import type { TeamMember } from '../domain';
import { AreaChart, Gauge } from './AnalyticsCharts';
import { monthlyCounts, percentage } from './team-analytics-data';
import styles from './TeamAnalytics.module.css';

export interface TeamAnalyticsProps {
  readonly members: readonly TeamMember[];
}

/**
 * Team analytics: a real certificate-issuance trend (bucketed from issue dates) and a
 * course-completion gauge (completed vs assigned across the team). Hand-rolled SVG — no chart
 * dependency. The parent already covers headline numbers as stat cards, so this stays visual.
 */
export const TeamAnalytics = ({ members }: TeamAnalyticsProps): ReactElement | null => {
  const certificates = useCertificates();
  const certs = certificates.data ?? [];
  if (members.length === 0 && certs.length === 0) {
    return null;
  }

  const now = new Date();
  const trend = monthlyCounts(
    certs.map((cert) => cert.issuedDate),
    now,
    6,
  );
  const earnedRecently = trend.reduce((sum, point) => sum + point.value, 0);
  const completed = members.reduce((sum, member) => sum + member.completed, 0);
  const assigned = members.reduce((sum, member) => sum + member.total, 0);
  const completionRate = percentage(completed, assigned);

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
          caption={`${String(completed)} of ${String(assigned)} team courses completed`}
        />
      </div>
    </div>
  );
};
