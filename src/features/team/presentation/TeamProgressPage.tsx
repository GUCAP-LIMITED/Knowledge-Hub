import type { ReactElement } from 'react';
import { AlertCircle, Eye, TrendingUp, Users } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  EmptyState,
  PageHeader,
  ProgressBar,
  Spinner,
  StatCard,
} from '@shared/ui';
import { cn } from '@shared/utils';
import type { TeamMember } from '../domain';
import { useTeamMembers } from './use-team';
import { AtRiskPanel, ProgressDistribution } from './TeamInsights';
import { TeamAnalytics } from './TeamAnalytics';
import styles from './TeamProgressPage.module.css';

const HEADERS = ['Member', 'Role', 'Progress', 'Courses', 'Last Active'] as const;

const MemberRow = ({ member }: { readonly member: TeamMember }): ReactElement => (
  <tr className={styles.row}>
    <td className={styles.cell} data-label="Member">
      <div className={styles.member}>
        <Avatar name={member.name} size={36} online={member.status === 'online'} />
        <div className={styles.memberText}>
          <div className={styles.name}>{member.name}</div>
          <div className={styles.email}>{member.email}</div>
        </div>
      </div>
    </td>
    <td className={styles.cell} data-label="Role">
      <Badge>{member.role}</Badge>
    </td>
    <td className={cn(styles.cell, styles.progressCell)} data-label="Progress">
      <div className={styles.progressWrap}>
        <ProgressBar value={member.progress} tone="auto" />
      </div>
      <span className={styles.pct}>{member.progress}%</span>
    </td>
    <td className={cn(styles.cell, styles.muted)} data-label="Courses">
      {member.completed}/{member.total}
    </td>
    <td className={cn(styles.cell, styles.muted)} data-label="Last active">
      {member.lastActive}
    </td>
  </tr>
);

/** Team progress: 4 stats + a member table. Admin only. */
export const TeamProgressPage = (): ReactElement => {
  const team = useTeamMembers();
  const members = team.data ?? [];
  const avg =
    members.length > 0
      ? Math.round(
          members.reduce((sum, member) => sum + member.progress, 0) / members.length,
        )
      : 0;
  const online = members.filter((member) => member.status === 'online').length;
  const atRisk = members.filter((member) => member.progress < 50).length;

  if (team.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading team" />
      </div>
    );
  }
  if (team.isError) {
    return (
      <Alert tone="error" title="Could not load the team">
        {team.error.message}
      </Alert>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader title="Team Progress" subtitle="Track learning across your team" />
      <div className={styles.stats}>
        <StatCard
          label="Team Members"
          value={members.length}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Avg Progress"
          value={`${String(avg)}%`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard label="Active Now" value={online} icon={Eye} tone="info" />
        <StatCard label="At Risk" value={atRisk} icon={AlertCircle} tone="warning" />
      </div>
      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members"
          description="Team members will appear here."
        />
      ) : (
        <>
          <TeamAnalytics members={members} />
          <div className={styles.insights}>
            <ProgressDistribution members={members} />
            <AtRiskPanel members={members} />
          </div>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {HEADERS.map((header) => (
                    <th key={header} className={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
