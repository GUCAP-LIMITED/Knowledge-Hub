import type { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, TrendingUp, Users } from 'lucide-react';
import {
  Alert,
  Button,
  EmptyState,
  PageHeader,
  StatCard,
  StatCardsSkeleton,
  TableSkeleton,
} from '@shared/ui';
import type { TeamMember, TeamProgressOverview } from '../domain';
import {
  useInfiniteAtRiskMembers,
  useInfiniteTeamMembers,
  useTeamProgressOverview,
} from './use-team';
import { AtRiskPanel, ProgressDistribution } from './TeamInsights';
import { TeamAnalytics } from './TeamAnalytics';
import { TeamProgressTable } from './TeamProgressTable';
import styles from './TeamProgressPage.module.css';

const getIsFromDashboard = (state: unknown): boolean =>
  Boolean((state as { fromDashboardAction?: boolean } | null)?.fromDashboardAction);

interface ResolvedTeamData {
  readonly members: readonly TeamMember[];
  readonly totalMembersCount: number;
  readonly atRiskMembers: readonly TeamMember[];
  readonly totalAtRiskCount: number;
}

const resolveTeamData = (
  overview: TeamProgressOverview,
  membersPages?: readonly {
    readonly items: readonly TeamMember[];
    readonly totalCount: number;
  }[],
  atRiskPages?: readonly {
    readonly items: readonly TeamMember[];
    readonly totalCount: number;
  }[],
): ResolvedTeamData => ({
  members: membersPages ? membersPages.flatMap((p) => p.items) : overview.members,
  totalMembersCount: membersPages?.[0]?.totalCount ?? overview.totalMembers,
  atRiskMembers: atRiskPages
    ? atRiskPages.flatMap((p) => p.items)
    : overview.atRiskMembers,
  totalAtRiskCount: atRiskPages?.[0]?.totalCount ?? overview.atRisk,
});

const TeamProgressSkeleton = ({
  isFromDashboard,
  onBack,
}: {
  readonly isFromDashboard: boolean;
  readonly onBack: () => void;
}): ReactElement => (
  <section className={styles.screen}>
    <PageHeader title="Team Progress" subtitle="Track learning across your team">
      {isFromDashboard ? (
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
        </Button>
      ) : null}
    </PageHeader>
    <StatCardsSkeleton />
    <TableSkeleton columns={5} />
  </section>
);

const TeamProgressStats = ({
  overview,
}: {
  readonly overview: TeamProgressOverview;
}): ReactElement => (
  <div className={styles.stats}>
    <StatCard
      label="Team Members"
      value={overview.totalMembers}
      icon={Users}
      tone="primary"
    />
    <StatCard
      label="Avg Progress"
      value={`${String(overview.avgProgress)}%`}
      icon={TrendingUp}
      tone="success"
    />
    <StatCard label="Active Now" value={overview.activeNow} icon={Eye} tone="info" />
    <StatCard label="At Risk" value={overview.atRisk} icon={AlertCircle} tone="warning" />
  </div>
);

interface TeamProgressContentProps {
  readonly overview: TeamProgressOverview;
  readonly members: readonly TeamMember[];
  readonly totalMembersCount: number;
  readonly isMembersLoading: boolean;
  readonly hasNextMembers: boolean;
  readonly isFetchingNextMembers: boolean;
  readonly onFetchNextMembers: () => void;
  readonly atRiskMembers: readonly TeamMember[];
  readonly totalAtRiskCount: number;
  readonly hasNextAtRisk: boolean;
  readonly isFetchingNextAtRisk: boolean;
  readonly onFetchNextAtRisk: () => void;
}

const TeamProgressContent = ({
  overview,
  members,
  totalMembersCount,
  isMembersLoading,
  hasNextMembers,
  isFetchingNextMembers,
  onFetchNextMembers,
  atRiskMembers,
  totalAtRiskCount,
  hasNextAtRisk,
  isFetchingNextAtRisk,
  onFetchNextAtRisk,
}: TeamProgressContentProps): ReactElement => {
  if (overview.totalMembers === 0 && members.length === 0) {
    return (
      <EmptyState title="No team members" description="Team members will appear here." />
    );
  }

  return (
    <>
      <TeamAnalytics
        members={members}
        teamTotalCourses={overview.teamTotalCourses}
        teamCompletedCourses={overview.teamCompletedCourses}
        certificatesEarnedDates={overview.certificatesEarnedDates}
      />
      <div className={styles.insights}>
        <ProgressDistribution distribution={overview.progressDistribution} />
        <AtRiskPanel
          atRiskMembers={atRiskMembers}
          totalCount={totalAtRiskCount}
          hasNextPage={hasNextAtRisk}
          isFetchingNextPage={isFetchingNextAtRisk}
          onFetchNextPage={onFetchNextAtRisk}
        />
      </div>
      {isMembersLoading && members.length === 0 ? (
        <TableSkeleton columns={5} />
      ) : (
        <TeamProgressTable
          members={members}
          totalCount={totalMembersCount}
          hasNextPage={hasNextMembers}
          isFetchingNextPage={isFetchingNextMembers}
          onFetchNextPage={onFetchNextMembers}
        />
      )}
    </>
  );
};

/** Team progress: 4 stats + insights + infinite scrolling member table. Admin only. */
export const TeamProgressPage = (): ReactElement | null => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromDashboard = getIsFromDashboard(location.state);
  const team = useTeamProgressOverview();
  const membersQuery = useInfiniteTeamMembers(15);
  const atRiskQuery = useInfiniteAtRiskMembers(8);

  const handleBack = (): void => {
    navigate('/dashboard');
  };

  const handleFetchNextMembers = (): void => {
    void membersQuery.fetchNextPage();
  };

  const handleFetchNextAtRisk = (): void => {
    void atRiskQuery.fetchNextPage();
  };

  if (team.isLoading) {
    return <TeamProgressSkeleton isFromDashboard={isFromDashboard} onBack={handleBack} />;
  }
  if (team.isError) {
    return (
      <Alert tone="error" title="Could not load the team">
        {team.error.message}
      </Alert>
    );
  }

  const overview = team.data;
  if (!overview) {
    return null;
  }

  const { members, totalMembersCount, atRiskMembers, totalAtRiskCount } = resolveTeamData(
    overview,
    membersQuery.data?.pages,
    atRiskQuery.data?.pages,
  );

  return (
    <section className={styles.screen}>
      <PageHeader title="Team Progress" subtitle="Track learning across your team">
        {isFromDashboard ? (
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
          </Button>
        ) : null}
      </PageHeader>
      <TeamProgressStats overview={overview} />
      <TeamProgressContent
        overview={overview}
        members={members}
        totalMembersCount={totalMembersCount}
        isMembersLoading={membersQuery.isLoading}
        hasNextMembers={membersQuery.hasNextPage}
        isFetchingNextMembers={membersQuery.isFetchingNextPage}
        onFetchNextMembers={handleFetchNextMembers}
        atRiskMembers={atRiskMembers}
        totalAtRiskCount={totalAtRiskCount}
        hasNextAtRisk={atRiskQuery.hasNextPage}
        isFetchingNextAtRisk={atRiskQuery.isFetchingNextPage}
        onFetchNextAtRisk={handleFetchNextAtRisk}
      />
    </section>
  );
};
