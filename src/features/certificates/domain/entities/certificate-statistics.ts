/** Breakdown of certificates gained by members of a team. */
export interface CertificateTeamSummary {
  readonly teamId: string;
  readonly teamName: string;
  readonly certificateCount: number;
}

/** Breakdown of certificates gained by learners with a specific role. */
export interface CertificateRoleSummary {
  readonly userTypeId: string;
  readonly roleName: string;
  readonly certificateCount: number;
}

/** High-level analytics overview with KPI metrics and team/role breakdowns. */
export interface CertificateStatisticsOverview {
  readonly totalIssuedCertificates: number;
  readonly totalTeamsWithCertificates: number;
  readonly totalCategories: number;
  readonly teams: readonly CertificateTeamSummary[];
  readonly roles: readonly CertificateRoleSummary[];
}
