import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeCertificateGateway } from '@testing/fakes/fake-certificate-gateway';
import { CertificatesUnavailableError } from '../../domain';
import { GetCertificateStatisticsOverviewUseCase } from './get-certificate-statistics-overview';

const makeUseCase = (
  gateway: FakeCertificateGateway,
): GetCertificateStatisticsOverviewUseCase =>
  new GetCertificateStatisticsOverviewUseCase({
    certificateGateway: gateway,
    logger: silentLogger(),
  });

describe('GetCertificateStatisticsOverviewUseCase', () => {
  it('returns statistics overview from the gateway', async () => {
    const gateway = new FakeCertificateGateway();
    gateway.statisticsOverviewResult = ok({
      totalIssuedCertificates: 45,
      totalTeamsWithCertificates: 3,
      totalCategories: 8,
      teams: [
        {
          teamId: 'team-1',
          teamName: 'The Sales Team',
          certificateCount: 25,
        },
      ],
      roles: [
        {
          userTypeId: 'role-1',
          roleName: 'Consultant',
          certificateCount: 20,
        },
      ],
    });

    const result = await makeUseCase(gateway).execute('branch-123');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalIssuedCertificates).toBe(45);
      expect(result.value.totalTeamsWithCertificates).toBe(3);
      expect(result.value.teams).toHaveLength(1);
      expect(result.value.roles).toHaveLength(1);
    }
    expect(gateway.lastBranchId).toBe('branch-123');
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeCertificateGateway();
    gateway.statisticsOverviewResult = err(new CertificatesUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
