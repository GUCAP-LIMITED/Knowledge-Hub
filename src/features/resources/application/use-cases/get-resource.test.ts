import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeResourceGateway } from '@testing/fakes/fake-resource-gateway';
import { buildResource } from '@testing/builders/resource.builder';
import { ResourceNotFoundError } from '../../domain';
import { GetResourceUseCase } from './get-resource';

const makeUseCase = (gateway: FakeResourceGateway): GetResourceUseCase =>
  new GetResourceUseCase({ resourceGateway: gateway, logger: silentLogger() });

describe('GetResourceUseCase', () => {
  it('returns a resource by ID from the gateway', async () => {
    const gateway = new FakeResourceGateway();
    gateway.getByIdResult = ok(
      buildResource({ id: 'res-42', title: 'Security Guidelines' }),
    );

    const result = await makeUseCase(gateway).execute('res-42');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.id).toBe('res-42');
      expect(result.value.title).toBe('Security Guidelines');
    }
    expect(gateway.lastRequestedId).toBe('res-42');
  });

  it('propagates a gateway not found error', async () => {
    const gateway = new FakeResourceGateway();
    gateway.getByIdResult = err(new ResourceNotFoundError('Not found'));

    const result = await makeUseCase(gateway).execute('unknown-id');

    expect(isErr(result)).toBe(true);
  });
});
