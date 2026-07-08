import { type Result, ok } from '@core/result';
import type {
  Certificate,
  CertificateError,
  CertificateGateway,
} from '@features/certificates/domain';
import { buildCertificate } from '../builders/certificate.builder';

/** Hand-written, fully-typed fake of the {@link CertificateGateway} port. */
export class FakeCertificateGateway implements CertificateGateway {
  public listResult: Result<readonly Certificate[], CertificateError> = ok([]);
  public getByIdResult: Result<Certificate, CertificateError> = ok(buildCertificate());

  public lastRequestedId: string | null = null;

  public list(): Promise<Result<readonly Certificate[], CertificateError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<Certificate, CertificateError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }
}
