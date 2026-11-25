import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeResourceGateway } from '@testing/fakes/fake-resource-gateway';
import { ResourcesUnavailableError } from '../../domain';
import { GetResourceStatsUseCase } from './get-resource-stats';

const makeUseCase = (gateway: FakeResourceGateway): GetResourceStatsUseCase =>
  new GetResourceStatsUseCase({ resourceGateway: gateway, logger: silentLogger() });

describe('GetResourceStatsUseCase', () => {
  it('returns resource statistics from the gateway', async () => {
    const gateway = new FakeResourceGateway();
    gateway.getStatsResult = ok({
      totalCount: 42,
      categories: [
        { categoryId: 'cat-1', name: 'FAQs', slug: 'faqs', count: 12 },
        {
          categoryId: 'cat-2',
          name: 'Best Practices',
          slug: 'best-practices',
          count: 30,
        },
      ],
    });

    const result = await makeUseCase(gateway).execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalCount).toBe(42);
      expect(result.value.categories).toHaveLength(2);
      expect(result.value.categories[0]?.name).toBe('FAQs');
      expect(result.value.categories[0]?.count).toBe(12);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeResourceGateway();
    gateway.getStatsResult = err(new ResourcesUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
