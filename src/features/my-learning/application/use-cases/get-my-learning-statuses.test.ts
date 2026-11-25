import { describe, expect, it, vi } from 'vitest';
import { ok } from '@core/result';
import type { Logger } from '@core/logger';
import { GetMyLearningStatusesUseCase } from './get-my-learning-statuses';
import type { MyLearningGateway } from '../../domain/ports/my-learning-gateway';
import type { MyLearningStatusOption } from '../../domain/types';

const mockLogger: Logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: () => mockLogger,
};

describe('GetMyLearningStatusesUseCase', () => {
  it('calls gateway.getMyLearningStatuses and returns result', async () => {
    const mockStatuses: readonly MyLearningStatusOption[] = [
      { value: 0, name: 'NotStarted', label: 'Not Started' },
      { value: 1, name: 'InProgress', label: 'In Progress' },
    ];

    const mockGateway: MyLearningGateway = {
      getMyLearning: vi.fn(),
      getStats: vi.fn(),
      getMyLearningStatuses: vi.fn().mockResolvedValue(ok(mockStatuses)),
    };

    const useCase = new GetMyLearningStatusesUseCase({
      myLearningGateway: mockGateway,
      logger: mockLogger,
    });

    const result = await useCase.execute();

    expect(mockGateway.getMyLearningStatuses).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(mockStatuses);
    }
  });
});
