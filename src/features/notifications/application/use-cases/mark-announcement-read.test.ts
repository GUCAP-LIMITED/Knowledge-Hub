import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { AnnouncementNotFoundError } from '../../domain';
import { FakeNotificationGateway, buildAnnouncement, silentLogger } from '@testing';
import { MarkAnnouncementReadUseCase } from './mark-announcement-read';

describe('MarkAnnouncementReadUseCase', () => {
  it('delegates to the gateway and returns the read announcement on success', async () => {
    const gateway = new FakeNotificationGateway();
    const announcement = buildAnnouncement({ id: 'an-1', read: true });
    gateway.markReadResult = ok(announcement);

    const useCase = new MarkAnnouncementReadUseCase({
      notificationGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute('an-1');

    expect(gateway.lastReadId).toBe('an-1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.id).toBe('an-1');
      expect(result.value.read).toBe(true);
    }
  });

  it('propagates domain errors when gateway fails', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.markReadResult = err(new AnnouncementNotFoundError('an-404'));

    const useCase = new MarkAnnouncementReadUseCase({
      notificationGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute('an-404');

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('NOTIFICATIONS_NOT_FOUND');
    }
  });
});
