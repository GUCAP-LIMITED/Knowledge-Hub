import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Certificate,
  type CertificateError,
  type CertificateGateway,
  type CertificateListQuery,
  type CertificateListResult,
  CertificateNotFoundError,
  type CertificateStatisticsOverview,
} from '../domain';
import { CERTIFICATE_SEED } from './certificate-seed';

export interface InMemoryCertificateGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link CertificateGateway}, seeded from the prototype data. A
 * legitimate infrastructure adapter (storage, not network) — it keeps the app a working prototype
 * with no backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryCertificateGateway implements CertificateGateway {
  private readonly logger: Logger;
  private readonly certificates: Map<string, Certificate>;

  public constructor(deps: InMemoryCertificateGatewayDeps) {
    this.logger = deps.logger.child('certificate-gateway');
    this.certificates = new Map(
      CERTIFICATE_SEED.map((props) => [props.id, new Certificate(props)]),
    );
  }

  public getStatisticsOverview(): Promise<
    Result<CertificateStatisticsOverview, CertificateError>
  > {
    const list = [...this.certificates.values()];
    const categories = new Set(list.map((cert) => cert.category)).size;
    const overview: CertificateStatisticsOverview = {
      totalIssuedCertificates: list.length,
      totalTeamsWithCertificates: 3,
      totalCategories: categories,
      teams: [
        { teamId: 'team-sales', teamName: 'Sales Team', certificateCount: 12 },
        {
          teamId: 'team-cs',
          teamName: 'Customer Success',
          certificateCount: 8,
        },
      ],
      roles: [
        {
          userTypeId: 'role-consultant',
          roleName: 'Consultant',
          certificateCount: 15,
        },
        {
          userTypeId: 'role-leader',
          roleName: 'Sales Team Leader',
          certificateCount: 5,
        },
      ],
    };
    return Promise.resolve(ok(overview));
  }

  public list(
    query?: CertificateListQuery,
  ): Promise<Result<CertificateListResult, CertificateError>> {
    let items = [...this.certificates.values()];
    if (query?.filter !== undefined && query.filter.trim().length > 0) {
      const needle = query.filter.toLowerCase();
      items = items.filter(
        (cert) =>
          cert.courseName.toLowerCase().includes(needle) ||
          cert.userName.toLowerCase().includes(needle),
      );
    }
    const skip = query?.skipCount ?? 0;
    const take = query?.maxResultCount ?? items.length;
    const paged = items.slice(skip, skip + take);

    return Promise.resolve(
      ok({
        totalCount: items.length,
        myTotalCertificates: items.length,
        items: paged,
      }),
    );
  }

  public getById(id: string): Promise<Result<Certificate, CertificateError>> {
    const certificate = this.certificates.get(id);
    if (certificate === undefined) {
      this.logger.warn('Certificate not found', { id });
      return Promise.resolve(err(new CertificateNotFoundError(id)));
    }
    return Promise.resolve(ok(certificate));
  }
}
