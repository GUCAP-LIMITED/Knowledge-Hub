import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { Certificate } from '../domain';
import styles from './CertificatesPage.module.css';

type BandClass = 'expDanger' | 'expWarn' | 'expInfo' | 'expOk';

interface ExpiryBand {
  readonly key: string;
  readonly label: string;
  readonly cls: BandClass;
  readonly test: (days: number) => boolean;
}

const EXPIRY_BANDS: readonly ExpiryBand[] = [
  { key: 'expired', label: 'Expired', cls: 'expDanger', test: (d) => d < 0 },
  { key: 'soon', label: '≤ 30 days', cls: 'expWarn', test: (d) => d >= 0 && d <= 30 },
  { key: 'later', label: '31–90 days', cls: 'expInfo', test: (d) => d > 30 && d <= 90 },
  { key: 'valid', label: '90+ days', cls: 'expOk', test: (d) => d > 90 },
];

const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

/** Admin-only expiry timeline: how many certificates fall into each compliance window. */
const ExpiryTimeline = ({
  certificates,
  now,
}: {
  readonly certificates: readonly Certificate[];
  readonly now: Date;
}): ReactElement => {
  const days = certificates.map((cert) => cert.daysUntilExpiry(now));
  const bands = EXPIRY_BANDS.map((band) => ({
    ...band,
    count: days.filter(band.test).length,
  }));
  return (
    <section className={styles.insightCard}>
      <h2 className={styles.insightTitle}>Expiry timeline</h2>
      <div className={styles.timelineBar}>
        {bands.map((band) =>
          band.count > 0 ? (
            <div
              key={band.key}
              className={cn(styles.timelineSeg, styles[band.cls])}
              style={{ flexGrow: band.count }}
              title={`${band.label}: ${String(band.count)}`}
            />
          ) : null,
        )}
      </div>
      <ul className={styles.timelineLegend}>
        {bands.map((band) => (
          <li key={band.key} className={styles.legendItem}>
            <span className={cn(styles.legendDot, styles[band.cls])} aria-hidden="true" />
            <span className={styles.legendLabel}>{band.label}</span>
            <span className={styles.legendCount}>{band.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Admin-only coverage view: how many certificates each role holds. */
const CoverageByRole = ({
  certificates,
}: {
  readonly certificates: readonly Certificate[];
}): ReactElement => {
  const counts = new Map<string, number>();
  for (const cert of certificates) {
    const role = titleCase(cert.userRole);
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, count]) => count));
  return (
    <section className={styles.insightCard}>
      <h2 className={styles.insightTitle}>Coverage by role</h2>
      <ul className={styles.coverageList}>
        {rows.map(([role, count]) => (
          <li key={role} className={styles.coverageRow}>
            <span className={styles.coverageRole}>{role}</span>
            <span className={styles.coverageTrack}>
              <span
                className={styles.coverageFill}
                style={{ width: `${String(Math.round((count / max) * 100))}%` }}
              />
            </span>
            <span className={styles.coverageCount}>{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Two admin compliance panels: the expiry timeline and per-role coverage. */
export const CertificateInsights = ({
  certificates,
  now,
}: {
  readonly certificates: readonly Certificate[];
  readonly now: Date;
}): ReactElement | null => {
  if (certificates.length === 0) return null;
  return (
    <div className={styles.insights}>
      <ExpiryTimeline certificates={certificates} now={now} />
      <CoverageByRole certificates={certificates} />
    </div>
  );
};
