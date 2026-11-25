import { type Result, ok } from '@core/result';
import type {
  Certificate,
  CertificateError,
  CertificateGateway,
  CertificateListQuery,
  CertificateListResult,
  CertificateStatisticsOverview,
} from '@features/certificates/domain';
import { buildCertificate } from '../builders/certificate.builder';

const DEFAULT_STATISTICS_OVERVIEW: CertificateStatisticsOverview = {
  totalIssuedCertificates: 10,
  totalTeamsWithCertificates: 2,
  totalCategories: 4,
  teams: [
    { teamId: 'team-sales', teamName: 'Sales Team', certificateCount: 6 },
    { teamId: 'team-cs', teamName: 'Customer Success', certificateCount: 4 },
  ],
  roles: [
    {
      userTypeId: 'role-consultant',
      roleName: 'Consultant',
      certificateCount: 7,
    },
    {
      userTypeId: 'role-manager',
      roleName: 'Sales Manager',
      certificateCount: 3,
    },
  ],
};

/** Hand-written, fully-typed fake of the {@link CertificateGateway} port. */
export class FakeCertificateGateway implements CertificateGateway {
  public statisticsOverviewResult: Result<
    CertificateStatisticsOverview,
    CertificateError
  > = ok(DEFAULT_STATISTICS_OVERVIEW);

  public listResult: Result<CertificateListResult, CertificateError> = ok({
    totalCount: 0,
    myTotalCertificates: 0,
    items: [],
  });

  public getByIdResult: Result<Certificate, CertificateError> = ok(buildCertificate());

  public lastRequestedId: string | null = null;
  public lastQuery: CertificateListQuery | undefined = undefined;
  public lastBranchId: string | undefined = undefined;

  public getStatisticsOverview(
    branchId?: string,
  ): Promise<Result<CertificateStatisticsOverview, CertificateError>> {
    this.lastBranchId = branchId;
    return Promise.resolve(this.statisticsOverviewResult);
  }

  public list(
    query?: CertificateListQuery,
  ): Promise<Result<CertificateListResult, CertificateError>> {
    this.lastQuery = query;
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<Certificate, CertificateError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }
}
