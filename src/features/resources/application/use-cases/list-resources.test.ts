import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeResourceGateway } from '@testing/fakes/fake-resource-gateway';
import { buildResource } from '@testing/builders/resource.builder';
import { ResourcesUnavailableError } from '../../domain';
import { ListResourcesUseCase } from './list-resources';

const makeUseCase = (gateway: FakeResourceGateway): ListResourcesUseCase =>
  new ListResourcesUseCase({ resourceGateway: gateway, logger: silentLogger() });

describe('ListResourcesUseCase', () => {
  it('returns the knowledge base from the gateway', async () => {
    const gateway = new FakeResourceGateway();
    gateway.listResult = ok([buildResource({ id: 'resource-9' })]);

    const result = await makeUseCase(gateway).execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe('resource-9');
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeResourceGateway();
    gateway.listResult = err(new ResourcesUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
