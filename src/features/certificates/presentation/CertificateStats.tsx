import type { ReactElement } from 'react';
import { AlertTriangle, Award, LayoutGrid, Star } from 'lucide-react';
import { StatCard } from '@shared/ui';
import type { Certificate } from '../domain';
import styles from './CertificatesPage.module.css';

export interface CertificateStatsProps {
  readonly certificates: readonly Certificate[];
  readonly now: Date;
}

/** Learner summary tiles: earned, distinctions, expiring soon, categories. */
export const CertificateStats = ({
  certificates,
  now,
}: CertificateStatsProps): ReactElement => {
  const distinctions = certificates.filter((cert) => cert.isDistinction()).length;
  const expiring = certificates.filter((cert) => cert.isExpiringSoon(now)).length;
  const categories = new Set(certificates.map((cert) => cert.category)).size;

  return (
    <div className={styles.stats}>
      <StatCard
        label="Total Earned"
        value={certificates.length}
        icon={Award}
        tone="secondary"
      />
      <StatCard label="Distinctions" value={distinctions} icon={Star} tone="warning" />
      <StatCard
        label="Expiring Soon"
        value={expiring}
        icon={AlertTriangle}
        tone="danger"
        hint="Within 90 days"
      />
      <StatCard label="Categories" value={categories} icon={LayoutGrid} tone="info" />
    </div>
  );
};
