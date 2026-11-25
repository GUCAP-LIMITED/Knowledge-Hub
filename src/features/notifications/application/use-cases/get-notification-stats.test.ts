import { describe, expect, it } from 'vitest';
import { isOk, ok } from '@core/result';
import { FakeNotificationGateway, buildAnnouncement, silentLogger } from '@testing';
import { GetNotificationStatsUseCase } from './get-notification-stats';

describe('GetNotificationStatsUseCase', () => {
  it('returns aggregated notification statistics from gateway', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.listResult = ok([
      buildAnnouncement({ id: 'n-1', read: false }),
      buildAnnouncement({ id: 'n-2', read: true }),
      buildAnnouncement({ id: 'n-3', read: true }),
    ]);
    const useCase = new GetNotificationStatsUseCase({
      notificationGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.totalCount).toBe(3);
      expect(result.value.readCount).toBe(2);
      expect(result.value.unreadCount).toBe(1);
    }
  });
});
