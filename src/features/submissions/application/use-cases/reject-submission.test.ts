import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import { FakeSubmissionGateway, buildSubmission, silentLogger } from '@testing';
import { RejectSubmissionUseCase } from './reject-submission';

const makeUseCase = (gateway: FakeSubmissionGateway): RejectSubmissionUseCase =>
  new RejectSubmissionUseCase({ submissionGateway: gateway, logger: silentLogger() });

describe('RejectSubmissionUseCase', () => {
  it('rejects a pending submission when given a reason', async () => {
    const gateway = new FakeSubmissionGateway();
    gateway.getByIdResult = ok(buildSubmission({ status: 'pending' }));
    gateway.saveResult = ok(buildSubmission({ status: 'rejected', note: 'because' }));

    const result = await makeUseCase(gateway).execute('sub-1', 'A valid reason');

    expect(isOk(result)).toBe(true);
    expect(gateway.lastSaved?.status).toBe('rejected');
  });

  it('fails without touching the gateway when the reason is empty', async () => {
    const gateway = new FakeSubmissionGateway();

    const result = await makeUseCase(gateway).execute('sub-1', '   ');

    expect(isErr(result)).toBe(true);
    expect(gateway.lastSaved).toBeNull();
  });
});
