import type { ReactElement } from 'react';
import type {
  CertificateRoleSummary,
  CertificateStatisticsOverview,
  CertificateTeamSummary,
} from '../domain';
import { formatUserType } from '@shared/utils';
import styles from './CertificatesPage.module.css';

/** Teams wise certificate earned breakdown: how many certificates each team has earned. */
const TeamsWiseCertificates = ({
  teams,
}: {
  readonly teams: readonly CertificateTeamSummary[];
}): ReactElement => {
  const max = Math.max(1, ...teams.map((t) => t.certificateCount));

  return (
    <section className={styles.insightCard}>
      <h2 className={styles.insightTitle}>Teams wise certificate earned</h2>
      {teams.length === 0 ? (
        <p className={styles.emptyInsight}>No team certificate data available yet.</p>
      ) : (
        <ul className={styles.coverageList}>
          {teams.map((team) => (
            <li key={team.teamId} className={styles.coverageRow}>
              <span className={styles.coverageRole} title={team.teamName}>
                {team.teamName}
              </span>
              <span className={styles.coverageTrack}>
                <span
                  className={styles.coverageFill}
                  style={{
                    width: `${String(Math.round((team.certificateCount / max) * 100))}%`,
                  }}
                />
              </span>
              <span className={styles.coverageCount}>{team.certificateCount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/** Coverage view: how many certificates each role holds. */
const CoverageByRole = ({
  roles,
}: {
  readonly roles: readonly CertificateRoleSummary[];
}): ReactElement => {
  const max = Math.max(1, ...roles.map((r) => r.certificateCount));

  return (
    <section className={styles.insightCard}>
      <h2 className={styles.insightTitle}>Coverage by role</h2>
      {roles.length === 0 ? (
        <p className={styles.emptyInsight}>No role certificate data available yet.</p>
      ) : (
        <ul className={styles.coverageList}>
          {roles.map((role) => (
            <li key={role.userTypeId} className={styles.coverageRow}>
              <span className={styles.coverageRole} title={formatUserType(role.roleName)}>
                {formatUserType(role.roleName)}
              </span>
              <span className={styles.coverageTrack}>
                <span
                  className={styles.coverageFill}
                  style={{
                    width: `${String(Math.round((role.certificateCount / max) * 100))}%`,
                  }}
                />
              </span>
              <span className={styles.coverageCount}>{role.certificateCount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export interface CertificateInsightsProps {
  readonly statistics?: CertificateStatisticsOverview | null | undefined;
}

/** Two admin compliance panels: teams wise certificates earned and per-role coverage. */
export const CertificateInsights = ({
  statistics,
}: CertificateInsightsProps): ReactElement | null => {
  if (statistics === null || statistics === undefined) {
    return null;
  }
  if (statistics.teams.length === 0 && statistics.roles.length === 0) {
    return null;
  }

  return (
    <div className={styles.insights}>
      <TeamsWiseCertificates teams={statistics.teams} />
      <CoverageByRole roles={statistics.roles} />
    </div>
  );
};
