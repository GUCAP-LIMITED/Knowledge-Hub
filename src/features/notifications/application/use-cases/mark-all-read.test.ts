import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { NotificationsUnavailableError } from '../../domain';
import { FakeNotificationGateway, buildAnnouncement, silentLogger } from '@testing';
import { MarkAllReadUseCase } from './mark-all-read';

describe('MarkAllReadUseCase', () => {
  it('delegates to the gateway and returns updated announcements', async () => {
    const gateway = new FakeNotificationGateway();
    const announcements = [
      buildAnnouncement({ id: 'an-1', read: true }),
      buildAnnouncement({ id: 'an-2', read: true }),
    ];
    gateway.markAllReadResult = ok(announcements);

    const useCase = new MarkAllReadUseCase({
      notificationGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(2);
      expect(result.value[0]?.read).toBe(true);
      expect(result.value[1]?.read).toBe(true);
    }
  });

  it('propagates domain errors when gateway fails', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.markAllReadResult = err(new NotificationsUnavailableError(new Error('Down')));

    const useCase = new MarkAllReadUseCase({
      notificationGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute();

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('NOTIFICATIONS_UNAVAILABLE');
    }
  });
});
