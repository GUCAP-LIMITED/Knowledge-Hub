import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok, err } from '@core/result';
import { FakeReviewGateway, silentLogger } from '@testing';
import { ReviewsUnavailableError, type SelectableContentItem } from '../../domain';
import { GetSelectableContentItemsUseCase } from './get-selectable-content-items';

const makeUseCase = (gateway: FakeReviewGateway): GetSelectableContentItemsUseCase =>
  new GetSelectableContentItemsUseCase({
    reviewGateway: gateway,
    logger: silentLogger(),
  });

describe('GetSelectableContentItemsUseCase', () => {
  it('returns selectable content items and records query parameters', async () => {
    const gateway = new FakeReviewGateway();
    const item: SelectableContentItem = {
      id: 'course-1',
      title: 'Advanced Clean Architecture',
      slug: 'advanced-clean-architecture',
      type: 0,
      typeName: 'Course',
    };

    gateway.getSelectableContentItemsResult = ok({
      totalCount: 1,
      items: [item],
    });

    const query = {
      type: 0,
      filter: 'Clean Architecture',
      skipCount: 0,
      maxResultCount: 20,
    };

    const result = await makeUseCase(gateway).execute(query);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalCount).toBe(1);
      expect(result.value.items[0]?.title).toBe('Advanced Clean Architecture');
      expect(result.value.items[0]?.typeName).toBe('Course');
    }
    expect(gateway.lastSelectableContentQuery).toEqual(query);
  });

  it('returns error when gateway fails', async () => {
    const gateway = new FakeReviewGateway();
    gateway.getSelectableContentItemsResult = err(
      new ReviewsUnavailableError('Unable to reach content service'),
    );

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
