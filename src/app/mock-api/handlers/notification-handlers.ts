import { notFound, paginate, requireUser, sortBy } from '../mock-context';
import type { MockState } from '../mock-state';
import type { MockRoute } from '../mock-types';

const BASE = '/api/app/notifications';

export const notificationHandlers = (state: MockState): readonly MockRoute[] => {
  const mine = (userId: string): typeof state.notifications =>
    state.notifications.filter((n) => n.userId === userId);

  return [
    {
      method: 'GET',
      pattern: BASE,
      handler: (request) => {
        const { isRead, topicId, sorting } = request.query;
        const matches = mine(requireUser(request).id).filter(
          (n) =>
            (isRead === undefined || n.isRead === (isRead === 'true')) &&
            (topicId === undefined || n.topicId === topicId),
        );
        return paginate(
          sortBy(matches, sorting ?? 'creationTime desc', {
            creationtime: (n) => Date.parse(n.creationTime),
          }),
          request.query,
        );
      },
    },
    {
      method: 'GET',
      pattern: `${BASE}/stats`,
      handler: (request) => {
        const items = mine(requireUser(request).id);
        const unread = items.filter((n) => !n.isRead).length;
        return {
          totalCount: items.length,
          readCount: items.length - unread,
          unreadCount: unread,
        };
      },
    },
    {
      method: 'PUT',
      pattern: `${BASE}/:id/read`,
      handler: (request) => {
        const item = mine(requireUser(request).id).find(
          (n) => n.id === request.params.id,
        );
        if (item === undefined) {
          throw notFound('Notification');
        }
        item.isRead = true;
        item.readTime = state.now.toISOString();
        return item;
      },
    },
    {
      method: 'POST',
      pattern: `${BASE}/mark-all-as-read`,
      handler: (request) => {
        for (const item of mine(requireUser(request).id)) {
          item.isRead = true;
          item.readTime ??= state.now.toISOString();
        }
        return null;
      },
    },
  ];
};
