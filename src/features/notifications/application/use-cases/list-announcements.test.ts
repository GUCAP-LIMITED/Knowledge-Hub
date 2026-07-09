import { describe, expect, it } from 'vitest';
import { isOk, ok } from '@core/result';
import { FakeNotificationGateway, buildAnnouncement, silentLogger } from '@testing';
import { ListAnnouncementsUseCase } from './list-announcements';

describe('ListAnnouncementsUseCase', () => {
  it('returns announcements from the gateway', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.listResult = ok([buildAnnouncement({ id: 'an-9' })]);
    const useCase = new ListAnnouncementsUseCase({
      notificationGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value[0]?.id).toBe('an-9');
    }
  });
});
