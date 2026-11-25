import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing/fakes/silent-logger';
import {
  CertificateTemplateLoadFailedError,
  type CertificateTemplateGateway,
  type CertificateTemplateRecord,
} from '../../domain';
import { GetCertificateTemplateUseCase } from './get-certificate-template';

const makeGateway = (
  get: CertificateTemplateGateway['get'],
): CertificateTemplateGateway => ({
  upsert: () => {
    throw new Error('not used in this test');
  },
  get,
});

const makeUseCase = (
  gateway: CertificateTemplateGateway,
): GetCertificateTemplateUseCase =>
  new GetCertificateTemplateUseCase({
    certificateTemplateGateway: gateway,
    logger: silentLogger(),
  });

describe('GetCertificateTemplateUseCase', () => {
  it('returns the record the gateway resolves', async () => {
    const record: CertificateTemplateRecord = {
      kind: 'course',
      content: '<html></html>',
      lastModificationTime: null,
    };
    const gateway = makeGateway(() => Promise.resolve(ok(record)));

    const result = await makeUseCase(gateway).execute('course');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual(record);
    }
  });

  it('resolves ok(null) when no template has been saved for the kind yet', async () => {
    const gateway = makeGateway(() => Promise.resolve(ok(null)));

    const result = await makeUseCase(gateway).execute('tutorial');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBeNull();
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = makeGateway(() =>
      Promise.resolve(err(new CertificateTemplateLoadFailedError())),
    );

    const result = await makeUseCase(gateway).execute('resource');

    expect(isErr(result)).toBe(true);
  });
});
