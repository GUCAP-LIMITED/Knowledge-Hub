import { z } from 'zod';

/** Wire shape for a team's certificate statistics breakdown. */
export const CertificateTeamSummaryDtoSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  certificateCount: z.number(),
});
export type CertificateTeamSummaryDto = z.infer<typeof CertificateTeamSummaryDtoSchema>;

/** Wire shape for a role's certificate statistics breakdown. */
export const CertificateRoleSummaryDtoSchema = z.object({
  userTypeId: z.string(),
  roleName: z.string(),
  certificateCount: z.number(),
});
export type CertificateRoleSummaryDto = z.infer<typeof CertificateRoleSummaryDtoSchema>;

/** Wire shape for GET /api/app/certificate/statistics-overview. */
export const CertificateStatisticsOverviewDtoSchema = z.object({
  totalIssuedCertificates: z.number(),
  totalTeamsWithCertificates: z.number(),
  totalCategories: z.number(),
  teams: z.array(CertificateTeamSummaryDtoSchema),
  roles: z.array(CertificateRoleSummaryDtoSchema),
});
export type CertificateStatisticsOverviewDto = z.infer<
  typeof CertificateStatisticsOverviewDtoSchema
>;

/** Wire shape for a single certificate record in GET /api/app/certificate. */
export const CertificateDtoSchema = z.object({
  id: z.string(),
  contentItemTitle: z.string(),
  contentType: z.number(),
  userName: z.string(),
  roleName: z.string().nullable().optional(),
  blobName: z.string(),
  blobUrl: z.string(),
  issuedAt: z.string(),
});
export type CertificateDto = z.infer<typeof CertificateDtoSchema>;

/** Wire shape for GET /api/app/certificate paginated response. */
export const CertificateListResultDtoSchema = z.object({
  totalCount: z.number(),
  myTotalCertificates: z.number(),
  items: z.array(CertificateDtoSchema),
});
export type CertificateListResultDto = z.infer<typeof CertificateListResultDtoSchema>;
