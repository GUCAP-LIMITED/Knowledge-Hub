import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeResourceGateway, silentLogger, buildResource } from '@testing';
import { ResourceNotFoundError } from '../../domain';
import { MarkResourceHelpfulUseCase } from './mark-resource-helpful';

const makeUseCase = (gateway: FakeResourceGateway): MarkResourceHelpfulUseCase =>
  new MarkResourceHelpfulUseCase({ resourceGateway: gateway, logger: silentLogger() });

describe('MarkResourceHelpfulUseCase', () => {
  it('marks the resource helpful via the gateway', async () => {
    const gateway = new FakeResourceGateway();
    gateway.markHelpfulResult = ok(
      buildResource({ id: 'res-1', helpful: 12, isHelpful: true }),
    );

    const result = await makeUseCase(gateway).execute('res-1');

    expect(gateway.lastMarkedHelpfulId).toBe('res-1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.helpful).toBe(12);
      expect(result.value.isHelpful).toBe(true);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeResourceGateway();
    gateway.markHelpfulResult = err(new ResourceNotFoundError('not found'));

    const result = await makeUseCase(gateway).execute('res-missing');

    expect(isErr(result)).toBe(true);
  });
});
