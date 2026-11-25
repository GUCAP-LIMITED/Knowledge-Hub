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

  it('parses extra metadata to extract deep-link action and label with route normalization', () => {
    const announcement = buildAnnouncement({
      extra: JSON.stringify({
        route: '/submissions/3a237913-221c-0e49-1169-699f05786fe8/edit',
        action: 'edit_revision',
        kind: 'revision_rejected_action_required',
      }),
    });

    const action = announcement.getAction();
    expect(action).toEqual({
      route: '/submissions/3a237913-221c-0e49-1169-699f05786fe8/edit',
      actionText: 'Update Draft Revision',
      kind: 'revision_rejected_action_required',
    });
  });

  it('normalizes legacy content edit routes to submissions edit', () => {
    const legacyEditAnnouncement = buildAnnouncement({
      extra: JSON.stringify({
        route:
          '/content/3a237913-221c-0e49-1169-699f05786fe8/edit?revisionId=3a23c0fa-827e-9837-bef0-309cda091e94',
        action: 'view_staged_changes',
        kind: 'revision_submitted_receipt',
      }),
    });

    const action = legacyEditAnnouncement.getAction();
    expect(action).toEqual({
      route: '/submissions/3a237913-221c-0e49-1169-699f05786fe8/edit',
      actionText: 'View Staged Changes',
      kind: 'revision_submitted_receipt',
    });
  });

  it('returns null when extra is missing or invalid JSON', () => {
    const noExtra = buildAnnouncement({ extra: undefined });
    expect(noExtra.getAction()).toBeNull();

    const invalidJson = buildAnnouncement({ extra: 'invalid-json' });
    expect(invalidJson.getAction()).toBeNull();

    const noRoute = buildAnnouncement({ extra: JSON.stringify({ action: 'view_live' }) });
    expect(noRoute.getAction()).toBeNull();
  });

  it('resolves view_assignments to View Assignments', () => {
    const announcement = buildAnnouncement({
      extra: JSON.stringify({
        route: '/training-assignments',
        action: 'view_assignments',
      }),
    });

    const action = announcement.getAction();
    expect(action).toEqual({
      route: '/assign',
      actionText: 'View Assignments',
      kind: undefined,
    });
  });

  it('resolves deadline reminder and overdue actions', () => {
    const dueSoonAnnouncement = buildAnnouncement({
      extra: JSON.stringify({
        route: '/my-learning',
        action: 'complete_now',
      }),
    });
    expect(dueSoonAnnouncement.getAction()).toEqual({
      route: '/my-learning',
      actionText: 'Complete Now',
      kind: undefined,
    });

    const overdueAnnouncement = buildAnnouncement({
      extra: JSON.stringify({
        route: '/my-learning?origin=assigned&status=3',
        action: 'open_training',
      }),
    });
    expect(overdueAnnouncement.getAction()).toEqual({
      route: '/my-learning?origin=assigned&status=3',
      actionText: 'Open Training',
      kind: undefined,
    });

    const managerEscalationAnnouncement = buildAnnouncement({
      extra: JSON.stringify({
        route: '/assign',
        action: 'view_team_status',
      }),
    });
    expect(managerEscalationAnnouncement.getAction()).toEqual({
      route: '/assign',
      actionText: 'View Team Status',
      kind: undefined,
    });
  });
});
