import {
  Certificate,
  type CertificateContentKind,
  type CertificateListResult,
  type CertificateStatisticsOverview,
} from '../domain';
import type {
  CertificateDto,
  CertificateListResultDto,
  CertificateStatisticsOverviewDto,
} from './dto/certificate-api.dto';

const CONTENT_TYPE_TUTORIAL = 5;
const CONTENT_TYPE_RESOURCE = 10;

/** Maps numeric ContentType enum to domain CertificateContentKind design key. */
export const toCertificateContentKind = (contentType: number): CertificateContentKind => {
  if (contentType === CONTENT_TYPE_TUTORIAL) {
    return 'tutorial';
  }
  if (contentType === CONTENT_TYPE_RESOURCE) {
    return 'resource';
  }
  return 'course';
};

/** Maps numeric ContentType enum to a human-readable category name. */
export const toCertificateCategory = (contentType: number): string => {
  if (contentType === CONTENT_TYPE_TUTORIAL) {
    return 'Tutorial';
  }
  if (contentType === CONTENT_TYPE_RESOURCE) {
    return 'Resource';
  }
  return 'Course';
};

/** Maps an external Certificate DTO to the pure domain entity. */
export const toCertificate = (dto: CertificateDto): Certificate =>
  new Certificate({
    id: dto.id,
    courseName: dto.contentItemTitle,
    userName: dto.userName,
    userRole: dto.roleName ?? 'Learner',
    issuedDate: new Date(dto.issuedAt),
    credentialId: dto.id.slice(0, 8).toUpperCase(),
    category: toCertificateCategory(dto.contentType),
    grade: 'Distinction',
    contentKind: toCertificateContentKind(dto.contentType),
    blobUrl: dto.blobUrl,
    blobName: dto.blobName,
  });

/** Maps an external paginated Certificate list DTO to domain CertificateListResult. */
export const toCertificateListResult = (
  dto: CertificateListResultDto,
): CertificateListResult => ({
  totalCount: dto.totalCount,
  myTotalCertificates: dto.myTotalCertificates,
  items: dto.items.map(toCertificate),
});

/** Maps an external statistics overview DTO to the domain CertificateStatisticsOverview. */
export const toCertificateStatisticsOverview = (
  dto: CertificateStatisticsOverviewDto,
): CertificateStatisticsOverview => ({
  totalIssuedCertificates: dto.totalIssuedCertificates,
  totalTeamsWithCertificates: dto.totalTeamsWithCertificates,
  totalCategories: dto.totalCategories,
  teams: dto.teams.map((team) => ({
    teamId: team.teamId,
    teamName: team.teamName,
    certificateCount: team.certificateCount,
  })),
  roles: dto.roles.map((role) => ({
    userTypeId: role.userTypeId,
    roleName: role.roleName,
    certificateCount: role.certificateCount,
  })),
});
