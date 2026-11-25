import { TeamMember, type TeamMemberProps } from './team-member';

export interface ProgressDistributionBandProps {
  readonly key: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly count: number;
}

export interface ProgressDistributionProps {
  readonly risk: number;
  readonly progressing: number;
  readonly onTrack: number;
  readonly complete: number;
  readonly bands?: readonly ProgressDistributionBandProps[];
}

export interface TeamProgressOverviewProps {
  readonly totalMembers: number;
  readonly avgProgress: number;
  readonly activeNow: number;
  readonly atRisk: number;
  readonly teamTotalCourses: number;
  readonly teamCompletedCourses: number;
  readonly progressDistribution?: ProgressDistributionProps;
  readonly members?: readonly TeamMemberProps[];
  readonly atRiskMembers?: readonly TeamMemberProps[];
  readonly certificatesEarnedDates: readonly Date[];
}

export class TeamProgressOverview {
  public readonly totalMembers: number;
  public readonly avgProgress: number;
  public readonly activeNow: number;
  public readonly atRisk: number;
  public readonly teamTotalCourses: number;
  public readonly teamCompletedCourses: number;
  public readonly progressDistribution: ProgressDistributionProps;
  public readonly members: readonly TeamMember[];
  public readonly atRiskMembers: readonly TeamMember[];
  public readonly certificatesEarnedDates: readonly Date[];

  public constructor(props: TeamProgressOverviewProps) {
    this.totalMembers = props.totalMembers;
    this.avgProgress = props.avgProgress;
    this.activeNow = props.activeNow;
    this.atRisk = props.atRisk;
    this.teamTotalCourses = props.teamTotalCourses;
    this.teamCompletedCourses = props.teamCompletedCourses;
    this.progressDistribution = props.progressDistribution ?? {
      risk: 0,
      progressing: 0,
      onTrack: 0,
      complete: 0,
      bands: [],
    };
    this.members = (props.members ?? []).map((m) => new TeamMember(m));
    this.atRiskMembers = (props.atRiskMembers ?? []).map((m) => new TeamMember(m));
    this.certificatesEarnedDates = props.certificatesEarnedDates;
  }
}
