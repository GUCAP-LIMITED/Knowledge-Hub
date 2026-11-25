import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import {
  type Certificate,
  type CertificateError,
  type CertificateGateway,
  type CertificateListQuery,
  type CertificateListResult,
  CertificateNotFoundError,
  type CertificateStatisticsOverview,
  CertificatesUnavailableError,
} from '../domain';
import {
  CertificateDtoSchema,
  CertificateListResultDtoSchema,
  CertificateStatisticsOverviewDtoSchema,
} from './dto/certificate-api.dto';
import {
  toCertificate,
  toCertificateListResult,
  toCertificateStatisticsOverview,
} from './certificate-mapper';

const CERTIFICATE_BASE = '/api/app/certificate';
const NOT_FOUND_STATUS = 404;

export interface CertificateHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/**
 * HTTP implementation of {@link CertificateGateway} communicating with the backend
 * certificates API. Validates external wire shapes with Zod and maps them to pure domain models.
 */
export class CertificateHttpGateway implements CertificateGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: CertificateHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('certificate-http-gateway');
  }

  public async getStatisticsOverview(
    branchId?: string,
  ): Promise<Result<CertificateStatisticsOverview, CertificateError>> {
    try {
      const raw = await this.httpClient.get<unknown>(
        `${CERTIFICATE_BASE}/statistics-overview`,
        {
          query: { branchId: branchId ?? undefined },
        },
      );
      const parsed = CertificateStatisticsOverviewDtoSchema.parse(raw);
      return ok(toCertificateStatisticsOverview(parsed));
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Loading certificate statistics overview failed', cause, {
        status,
        branchId,
      });
      return err(new CertificatesUnavailableError(cause));
    }
  }

  public async list(
    query?: CertificateListQuery,
  ): Promise<Result<CertificateListResult, CertificateError>> {
    try {
      const raw = await this.httpClient.get<unknown>(CERTIFICATE_BASE, {
        query: {
          skipCount: query?.skipCount,
          maxResultCount: query?.maxResultCount,
          sorting: query?.sorting,
          filter: query?.filter,
          userTypeId: query?.userTypeId,
          isSelf: query?.isSelf,
          branchId: query?.branchId,
        },
      });
      const parsed = CertificateListResultDtoSchema.parse(raw);
      return ok(toCertificateListResult(parsed));
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Listing certificates failed', cause, { status, query });
      return err(new CertificatesUnavailableError(cause));
    }
  }

  public async getById(id: string): Promise<Result<Certificate, CertificateError>> {
    try {
      const raw = await this.httpClient.get<unknown>(`${CERTIFICATE_BASE}/${id}`);
      const parsed = CertificateDtoSchema.parse(raw);
      return ok(toCertificate(parsed));
    } catch (cause) {
      if (cause instanceof HttpError && cause.status === NOT_FOUND_STATUS) {
        this.logger.warn('Certificate not found', { id });
        return err(new CertificateNotFoundError(id));
      }
      this.logger.error('Fetching certificate by id failed', cause, { id });
      return err(new CertificatesUnavailableError(cause));
    }
  }
}
