import type { CertificateKind, CertificateTemplateRecord } from '../domain';
import type { CertificateTemplateDto } from './dto/certificate-template-api.dto';

/** The backend's `CertificateTemplateKind` enum is serialised as PascalCase in the PUT body. */
const API_KIND_BY_KIND: Record<CertificateKind, string> = {
  course: 'Course',
  tutorial: 'Tutorial',
  resource: 'Resource',
};

export const toApiCertificateKind = (kind: CertificateKind): string =>
  API_KIND_BY_KIND[kind];

/** The same enum, but the GET-by-kind route takes it as a numeric path segment. */
const API_KIND_NUMBER_BY_KIND: Record<CertificateKind, number> = {
  course: 0,
  tutorial: 5,
  resource: 10,
};

export const toApiCertificateKindNumber = (kind: CertificateKind): number =>
  API_KIND_NUMBER_BY_KIND[kind];

export const toCertificateTemplateRecord = (
  kind: CertificateKind,
  dto: CertificateTemplateDto,
): CertificateTemplateRecord => ({
  kind,
  content: dto.content,
  lastModificationTime: dto.lastModificationTime ?? null,
});
