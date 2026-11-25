import { describe, expect, it, vi } from 'vitest';
import { ok } from '@core/result';
import type { Logger } from '@core/logger';
import { GetMyLearningUseCase } from './get-my-learning';
import type {
  MyLearningGateway,
  PagedMyLearningResult,
} from '../../domain/ports/my-learning-gateway';

const mockLogger: Logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: () => mockLogger,
};

describe('GetMyLearningUseCase', () => {
  it('calls gateway with correct parameters and returns result', async () => {
    const mockPagedResult: PagedMyLearningResult = {
      items: [],
      totalCount: 0,
    };

    const mockGateway: MyLearningGateway = {
      getMyLearning: vi.fn().mockResolvedValue(ok(mockPagedResult)),
      getStats: vi.fn(),
      getMyLearningStatuses: vi.fn(),
    };

    const useCase = new GetMyLearningUseCase({
      myLearningGateway: mockGateway,
      logger: mockLogger,
    });

    const params = {
      skipCount: 0,
      maxResultCount: 12,
      origin: 1,
      sorting: 'DueDate ASC',
    };

    const result = await useCase.execute(params);

    expect(mockGateway.getMyLearning).toHaveBeenCalledWith(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(mockPagedResult);
    }
  });
});
