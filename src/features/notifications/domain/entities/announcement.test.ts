import { describe, expect, it } from 'vitest';
import { buildAnnouncement } from '@testing';

describe('Announcement', () => {
  it('is unread by default and becomes read via markRead', () => {
    const announcement = buildAnnouncement({ read: false });
    expect(announcement.isUnread()).toBe(true);
    const read = announcement.markRead();
    expect(read).not.toBe(announcement);
    expect(read.isUnread()).toBe(false);
    expect(announcement.isUnread()).toBe(true);
  });
});
