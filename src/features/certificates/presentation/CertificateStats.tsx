import type { ReactElement } from 'react';
import { AlertTriangle, Award, LayoutGrid, Users } from 'lucide-react';
import { StatCard } from '@shared/ui';
import type { Certificate, CertificateStatisticsOverview } from '../domain';
import styles from './CertificatesPage.module.css';

export interface CertificateStatsProps {
  readonly statistics?: CertificateStatisticsOverview | null | undefined;
  readonly totalCount?: number | undefined;
  readonly myTotalCertificates?: number | undefined;
  readonly certificates?: readonly Certificate[] | undefined;
  readonly now: Date;
  readonly isAdmin?: boolean | undefined;
}
const resolveTotal = (
  isAdmin: boolean,
  stats: CertificateStatisticsOverview | null | undefined,
  total: number,
  myTotal: number,
): number => {
  if (isAdmin) {
    return stats?.totalIssuedCertificates ?? total;
  }
  return myTotal > 0 ? myTotal : total;
};

/** Summary tiles: total earned/issued, teams with certificates, expiring soon, categories. */
export const CertificateStats = (props: CertificateStatsProps): ReactElement => {
  const isAdmin = props.isAdmin === true;
  const total = props.totalCount ?? 0;
  const myTotal = props.myTotalCertificates ?? 0;
  const stats = props.statistics;
  const totalValue = resolveTotal(isAdmin, stats, total, myTotal);
  const teamsCount = stats?.totalTeamsWithCertificates ?? 0;
  const categoriesCount = stats?.totalCategories ?? 0;
  const list = props.certificates ?? [];
  const expiring = list.filter((cert) => cert.isExpiringSoon(props.now)).length;

  return (
    <div className={styles.stats}>
      <StatCard
        label={isAdmin ? 'Total Issued' : 'Total Earned'}
        value={totalValue}
        icon={Award}
        tone="secondary"
      />
      <StatCard
        label="Teams with Certificates"
        value={teamsCount}
        icon={Users}
        tone="warning"
      />
      <StatCard
        label="Expiring Soon"
        value={expiring}
        icon={AlertTriangle}
        tone="danger"
        hint="Within 90 days"
      />
      <StatCard
        label="Categories"
        value={categoriesCount}
        icon={LayoutGrid}
        tone="info"
      />
    </div>
  );
};
