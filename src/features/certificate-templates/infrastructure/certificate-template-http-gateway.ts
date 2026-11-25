import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import {
  type CertificateKind,
  type CertificateTemplateError,
  type CertificateTemplateGateway,
  type CertificateTemplateRecord,
  CertificateTemplateLoadFailedError,
  CertificateTemplateSaveFailedError,
} from '../domain';
import { CertificateTemplateDtoSchema } from './dto/certificate-template-api.dto';
import {
  toApiCertificateKind,
  toApiCertificateKindNumber,
  toCertificateTemplateRecord,
} from './certificate-template-mapper';

const BASE = '/api/app/certificate-template';

export interface CertificateTemplateHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP adapter for the certificate-template API — saves the admin-authored HTML per content kind. */
export class CertificateTemplateHttpGateway implements CertificateTemplateGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: CertificateTemplateHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('certificate-template-gateway');
  }

  public async upsert(
    kind: CertificateKind,
    html: string,
  ): Promise<Result<CertificateTemplateRecord, CertificateTemplateError>> {
    try {
      const raw = await this.httpClient.put<unknown>(BASE, {
        kind: toApiCertificateKind(kind),
        html,
      });
      return ok(
        toCertificateTemplateRecord(kind, CertificateTemplateDtoSchema.parse(raw)),
      );
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Certificate template save failed', cause, { status, kind });
      return err(new CertificateTemplateSaveFailedError(cause));
    }
  }

  public async get(
    kind: CertificateKind,
  ): Promise<Result<CertificateTemplateRecord | null, CertificateTemplateError>> {
    try {
      const raw = await this.httpClient.get<unknown>(
        `${BASE}/${String(toApiCertificateKindNumber(kind))}`,
      );
      return ok(
        toCertificateTemplateRecord(kind, CertificateTemplateDtoSchema.parse(raw)),
      );
    } catch (cause) {
      if (cause instanceof HttpError && cause.status === 404) {
        return ok(null);
      }
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Certificate template load failed', cause, { status, kind });
      return err(new CertificateTemplateLoadFailedError(cause));
    }
  }
}
