import type { Result } from '@core/result';
import type { CertificateError } from '../errors/certificate-errors';
import type { Certificate } from '../entities/certificate';
import type { CertificateStatisticsOverview } from '../entities/certificate-statistics';

/** Query parameters for fetching a paginated certificate directory. */
export interface CertificateListQuery {
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
  readonly sorting?: string | undefined;
  readonly filter?: string | undefined;
  readonly userTypeId?: string | undefined;
  readonly isSelf?: boolean | undefined;
  readonly branchId?: string | undefined;
}

/** Paginated directory result reported by the certificates domain. */
export interface CertificateListResult {
  readonly totalCount: number;
  readonly myTotalCertificates: number;
  readonly items: readonly Certificate[];
}

/**
 * Port to the issued-certificates source. The domain states the contract in its own terms;
 * storage or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface CertificateGateway {
  /** Fetch high-level statistics and team/role breakdowns. */
  getStatisticsOverview(
    branchId?: string,
  ): Promise<Result<CertificateStatisticsOverview, CertificateError>>;

  /** Fetch a paginated, filtered list of certificates. */
  list(
    query?: CertificateListQuery,
  ): Promise<Result<CertificateListResult, CertificateError>>;

  /** Fetch a single certificate by id. */
  getById(id: string): Promise<Result<Certificate, CertificateError>>;
}
