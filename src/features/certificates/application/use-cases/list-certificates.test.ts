import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeCertificateGateway } from '@testing/fakes/fake-certificate-gateway';
import { buildCertificate } from '@testing/builders/certificate.builder';
import { CertificatesUnavailableError } from '../../domain';
import { ListCertificatesUseCase } from './list-certificates';

const makeUseCase = (gateway: FakeCertificateGateway): ListCertificatesUseCase =>
  new ListCertificatesUseCase({ certificateGateway: gateway, logger: silentLogger() });

describe('ListCertificatesUseCase', () => {
  it('returns the certificates from the gateway', async () => {
    const gateway = new FakeCertificateGateway();
    gateway.listResult = ok({
      totalCount: 1,
      myTotalCertificates: 1,
      items: [buildCertificate({ id: 'CERT-2026-009' })],
    });

    const result = await makeUseCase(gateway).execute({
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0]?.id).toBe('CERT-2026-009');
      expect(result.value.totalCount).toBe(1);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeCertificateGateway();
    gateway.listResult = err(new CertificatesUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
