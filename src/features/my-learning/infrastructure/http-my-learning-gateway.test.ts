import { describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  HttpMyLearningGateway,
  FALLBACK_MY_LEARNING_STATUSES,
} from './http-my-learning-gateway';

const mockLogger: Logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: () => mockLogger,
};

describe('HttpMyLearningGateway.getMyLearningStatuses', () => {
  it('fetches, parses, and sorts statuses from /api/app/enum/MyLearningStatus', async () => {
    const rawEnums = [
      { value: 2, name: 'Completed', description: 'Completed' },
      { value: 0, name: 'NotStarted', description: 'Not Started' },
      { value: 1, name: 'InProgress', description: 'In Progress' },
      { value: 4, name: 'Paused', description: 'Paused' },
      { value: 3, name: 'Overdue', description: 'Overdue' },
    ];

    const mockHttpClient: HttpClient = {
      get: vi.fn().mockImplementation((url: string) => {
        if (url === '/api/app/enum/MyLearningStatus') {
          return Promise.resolve(rawEnums);
        }
        return Promise.reject(new Error(`Unexpected url: ${url}`));
      }),
      post: vi.fn(),
      postForm: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const gateway = new HttpMyLearningGateway({
      httpClient: mockHttpClient,
      logger: mockLogger,
    });

    const result = await gateway.getMyLearningStatuses();

    expect(mockHttpClient.get).toHaveBeenCalledWith('/api/app/enum/MyLearningStatus');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        { value: 0, name: 'NotStarted', label: 'Not Started' },
        { value: 1, name: 'InProgress', label: 'In Progress' },
        { value: 2, name: 'Completed', label: 'Completed' },
        { value: 3, name: 'Overdue', label: 'Overdue' },
        { value: 4, name: 'Paused', label: 'Paused' },
      ]);
    }
  });

  it('gracefully returns FALLBACK_MY_LEARNING_STATUSES on network failure', async () => {
    const mockHttpClient: HttpClient = {
      get: vi.fn().mockRejectedValue(new Error('Network error')),
      post: vi.fn(),
      postForm: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const gateway = new HttpMyLearningGateway({
      httpClient: mockHttpClient,
      logger: mockLogger,
    });

    const result = await gateway.getMyLearningStatuses();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(FALLBACK_MY_LEARNING_STATUSES);
    }
    expect(mockLogger.warn).toHaveBeenCalled();
  });
});
