import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeContentGateway } from '@testing/fakes/fake-content-gateway';
import { buildContentItem } from '@testing/builders/content-item.builder';
import { CreateContentUseCase } from './create-content';

const makeUseCase = (gateway: FakeContentGateway): CreateContentUseCase =>
  new CreateContentUseCase({ contentGateway: gateway, logger: silentLogger() });

describe('CreateContentUseCase', () => {
  it('creates a draft item from a valid title', async () => {
    const gateway = new FakeContentGateway();
    gateway.createResult = ok(buildContentItem({ id: 'ct-9', status: 'draft' }));

    const result = await makeUseCase(gateway).execute({
      title: 'A brand new article',
      type: 'Article',
      author: 'Md Shamim',
    });

    expect(isOk(result)).toBe(true);
    expect(gateway.lastCreated?.title).toBe('A brand new article');
    expect(gateway.lastCreated?.type).toBe('Article');
  });

  it('fails without touching the gateway when the title is too short', async () => {
    const gateway = new FakeContentGateway();

    const result = await makeUseCase(gateway).execute({
      title: 'no',
      type: 'Document',
      author: 'Md Shamim',
    });

    expect(isErr(result)).toBe(true);
    expect(gateway.lastCreated).toBeNull();
  });
});
