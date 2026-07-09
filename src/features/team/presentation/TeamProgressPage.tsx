import { useMemo, type ReactElement } from 'react';
import { CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  type BadgeTone,
  EmptyState,
  PageHeader,
  ProgressBar,
  Spinner,
  StatCard,
} from '@shared/ui';
import type { TeamMember, TeamMemberBucket } from '../domain';
import { useTeamMembers } from './use-team';
import styles from './TeamProgressPage.module.css';

const BUCKET_TONE: Record<TeamMemberBucket, BadgeTone> = {
  'on-track': 'success',
  'in-progress': 'info',
  'at-risk': 'warning',
};

const BUCKET_LABEL: Record<TeamMemberBucket, string> = {
  'on-track': 'On track',
  'in-progress': 'In progress',
  'at-risk': 'At risk',
};

interface TeamStats {
  readonly average: number;
  readonly onTrack: number;
  readonly atRisk: number;
}

const computeStats = (members: readonly TeamMember[]): TeamStats => {
  if (members.length === 0) {
    return { average: 0, onTrack: 0, atRisk: 0 };
  }
  const total = members.reduce((sum, member) => sum + member.progress, 0);
  const onTrack = members.filter((member) => member.bucket() === 'on-track').length;
  const atRisk = members.filter((member) => member.bucket() === 'at-risk').length;
  return { average: Math.round(total / members.length), onTrack, atRisk };
};

const MemberRow = ({ member }: { readonly member: TeamMember }): ReactElement => {
  const bucket = member.bucket();
  return (
    <li className={styles.row}>
      <div className={styles.person}>
        <Avatar name={member.name} online={member.status === 'online'} />
        <div className={styles.identity}>
          <span className={styles.name}>{member.name}</span>
          <span className={styles.role}>{member.role}</span>
          <span className={styles.email}>{member.email}</span>
        </div>
      </div>
      <div className={styles.progress}>
        <ProgressBar value={member.progress} showLabel />
      </div>
      <Badge tone={BUCKET_TONE[bucket]}>{BUCKET_LABEL[bucket]}</Badge>
      <span className={styles.count}>
        {member.completed}/{member.total}
      </span>
    </li>
  );
};

/** Routed team-progress page: headline stats plus a per-member progress list. */
export const TeamProgressPage = (): ReactElement => {
  const team = useTeamMembers();
  const members = useMemo(() => team.data ?? [], [team.data]);
  const stats = useMemo(() => computeStats(members), [members]);

  return (
    <section className={styles.screen}>
      <PageHeader title="Team Progress" subtitle="Track how your team is progressing" />

      {team.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading team" />
        </div>
      ) : null}

      {team.isError ? (
        <Alert tone="error" title="Could not load team">
          {team.error.message}
        </Alert>
      ) : null}

      {!team.isLoading && !team.isError ? (
        <>
          <div className={styles.stats}>
            <StatCard
              label="Average progress"
              value={`${String(stats.average)}%`}
              icon={TrendingUp}
              tone="primary"
            />
            <StatCard
              label="On track"
              value={stats.onTrack}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="At risk"
              value={stats.atRisk}
              icon={AlertTriangle}
              tone="warning"
            />
          </div>

          {members.length === 0 ? (
            <EmptyState
              title="No team members yet"
              description="Invite colleagues to see their learning progress here."
            />
          ) : (
            <ul className={styles.list}>
              {members.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  );
};
