import type { ReactElement } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Avatar, Badge, ProgressBar } from '@shared/ui';
import { cn } from '@shared/utils';
import type { TeamMember } from '../domain';
import styles from './TeamProgressPage.module.css';

const AT_RISK_CEILING = 50;

interface Band {
  readonly key: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly cls: 'bandDanger' | 'bandWarn' | 'bandInfo' | 'bandSuccess';
}

const BANDS: readonly Band[] = [
  { key: 'risk', label: 'At risk (0–49%)', min: 0, max: 49, cls: 'bandDanger' },
  {
    key: 'progressing',
    label: 'Progressing (50–74%)',
    min: 50,
    max: 74,
    cls: 'bandWarn',
  },
  { key: 'ontrack', label: 'On track (75–99%)', min: 75, max: 99, cls: 'bandInfo' },
  { key: 'complete', label: 'Complete (100%)', min: 100, max: 100, cls: 'bandSuccess' },
];

const countInBand = (members: readonly TeamMember[], band: Band): number =>
  members.filter((m) => m.progress >= band.min && m.progress <= band.max).length;

/** A segmented bar + legend showing how the team is spread across completion bands. */
export const ProgressDistribution = ({
  members,
}: {
  readonly members: readonly TeamMember[];
}): ReactElement => {
  const bands = BANDS.map((band) => ({ ...band, count: countInBand(members, band) }));
  return (
    <section className={styles.insightCard}>
      <h2 className={styles.insightTitle}>Progress distribution</h2>
      <div className={styles.distBar}>
        {bands.map((band) =>
          band.count > 0 ? (
            <div
              key={band.key}
              className={cn(styles.distSeg, styles[band.cls])}
              style={{ flexGrow: band.count }}
              title={`${band.label}: ${String(band.count)}`}
            />
          ) : null,
        )}
      </div>
      <ul className={styles.legend}>
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

const AtRiskRow = ({ member }: { readonly member: TeamMember }): ReactElement => (
  <li className={styles.riskRow}>
    <Avatar name={member.name} size={34} online={member.status === 'online'} />
    <div className={styles.riskWho}>
      <span className={styles.name}>{member.name}</span>
      <span className={styles.email}>
        {member.completed}/{member.total} courses · last active {member.lastActive}
      </span>
    </div>
    <div className={styles.riskProgress}>
      <ProgressBar value={member.progress} tone="auto" />
      <span className={styles.pct}>{member.progress}%</span>
    </div>
  </li>
);

/** Surfaces learners below the at-risk threshold so admins can intervene early. */
export const AtRiskPanel = ({
  members,
}: {
  readonly members: readonly TeamMember[];
}): ReactElement => {
  const atRisk = members.filter((m) => m.progress < AT_RISK_CEILING);

  if (atRisk.length === 0) {
    return (
      <section className={cn(styles.insightCard, styles.riskOk)}>
        <CheckCircle2 size={20} aria-hidden="true" className={styles.riskOkIcon} />
        <div>
          <h2 className={styles.insightTitle}>Everyone’s on track</h2>
          <p className={styles.riskHint}>
            No learners are below {AT_RISK_CEILING}% completion.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn(styles.insightCard, styles.riskCard)}>
      <div className={styles.riskHead}>
        <AlertTriangle size={18} aria-hidden="true" className={styles.riskIcon} />
        <h2 className={styles.insightTitle}>At-risk learners</h2>
        <Badge tone="warning">{atRisk.length}</Badge>
      </div>
      <ul className={styles.riskList}>
        {atRisk.map((member) => (
          <AtRiskRow key={member.id} member={member} />
        ))}
      </ul>
    </section>
  );
};
