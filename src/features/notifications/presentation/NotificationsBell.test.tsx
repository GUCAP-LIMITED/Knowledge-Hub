import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { ok } from '@core/result';
import { FakeNotificationGateway, buildAnnouncement, silentLogger } from '@testing';
import { MemoryRouter } from 'react-router-dom';
import { createNotificationsModule } from '../notifications-module';
import { NotificationsModuleProvider } from './NotificationsModuleProvider';
import { NotificationsBell } from './NotificationsBell';

vi.mock('./use-notification-sse', () => ({
  useNotificationSse: vi.fn(),
}));

const renderBellWithGateway = (
  gateway: FakeNotificationGateway,
): {
  queryClient: QueryClient;
  rendered: ReactElement;
} => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const module = createNotificationsModule({
    logger: silentLogger(),
  });
  const mockModule = {
    ...module,
    listAnnouncements: {
      execute: () => gateway.list(),
      executePaged: (params: Parameters<typeof gateway.listPaged>[0]) =>
        gateway.listPaged(params),
    },
    getNotificationStats: {
      execute: () => gateway.getStats(),
    },
    markAnnouncementRead: {
      execute: (id: string) => gateway.markRead(id),
    },
    markAllRead: {
      execute: () => gateway.markAllRead(),
    },
  };

  const rendered = (
    <QueryClientProvider client={queryClient}>
      <NotificationsModuleProvider module={mockModule as unknown as typeof module}>
        <MemoryRouter>
          <NotificationsBell />
        </MemoryRouter>
      </NotificationsModuleProvider>
    </QueryClientProvider>
  );

  return { queryClient, rendered };
};

describe('<NotificationsBell />', () => {
  it('renders unread count and opens panel displaying announcement items', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.listResult = ok([
      buildAnnouncement({
        id: 'n-1',
        title: 'Platform Maintenance',
        content: 'System will update at midnight',
        read: false,
      }),
    ]);

    const { rendered } = renderBellWithGateway(gateway);
    render(rendered);

    // Initial load: unread count badge should appear
    expect(await screen.findByText('1')).toBeInTheDocument();

    // Click the bell button to open panel
    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();
    expect(await screen.findByText('Platform Maintenance')).toBeInTheDocument();
    expect(screen.getByText('System will update at midnight')).toBeInTheDocument();
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('shows empty state when there are no announcements', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.listResult = ok([]);

    const { rendered } = renderBellWithGateway(gateway);
    render(rendered);

    // Click to open panel
    const bellBtn = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(bellBtn);

    expect(await screen.findByText("You're all caught up.")).toBeInTheDocument();
    expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
  });

  it('marks a single announcement as read on click', async () => {
    const gateway = new FakeNotificationGateway();
    const item = buildAnnouncement({
      id: 'n-2',
      title: 'Course Assigned',
      read: false,
    });
    gateway.listResult = ok([item]);
    gateway.markReadResult = ok(buildAnnouncement({ id: 'n-2', read: true }));

    const { rendered } = renderBellWithGateway(gateway);
    render(rendered);

    fireEvent.click(await screen.findByRole('button', { name: /notifications/i }));
    const itemBtn = await screen.findByText('Course Assigned');
    fireEvent.click(itemBtn);

    await waitFor(() => {
      expect(gateway.lastReadId).toBe('n-2');
    });
  });

  it('marks all announcements as read and closes on backdrop click', async () => {
    const gateway = new FakeNotificationGateway();
    const item = buildAnnouncement({ id: 'n-3', title: 'Security Alert', read: false });
    gateway.listResult = ok([item]);
    gateway.markAllReadResult = ok([
      buildAnnouncement({ id: 'n-3', title: 'Security Alert', read: true }),
    ]);

    const { rendered } = renderBellWithGateway(gateway);
    render(rendered);

    fireEvent.click(await screen.findByRole('button', { name: /notifications/i }));

    const markAllBtn = await screen.findByText('Mark all read');
    fireEvent.click(markAllBtn);

    // Click backdrop to close
    const backdrop = screen.getByLabelText('Close notifications');
    fireEvent.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders action button and triggers read when clicked', async () => {
    const gateway = new FakeNotificationGateway();
    const item = buildAnnouncement({
      id: 'n-4',
      title: 'New Content Awaiting Review',
      content: 'A new draft needs moderation',
      read: false,
      extra: JSON.stringify({
        route: '/content/review-studio/item-1',
        action: 'review_submission',
      }),
    });
    gateway.listResult = ok([item]);
    gateway.markReadResult = ok(buildAnnouncement({ id: 'n-4', read: true }));

    const { rendered } = renderBellWithGateway(gateway);
    render(rendered);

    fireEvent.click(await screen.findByRole('button', { name: /notifications/i }));
    const actionBtn = await screen.findByRole('button', { name: 'Review Submission' });
    expect(actionBtn).toBeInTheDocument();

    fireEvent.click(actionBtn);

    await waitFor(() => {
      expect(gateway.lastReadId).toBe('n-4');
    });
  });

  it('filters between All and Unread tabs', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.listResult = ok([
      buildAnnouncement({ id: 'n-5', title: 'Unread Notice', read: false }),
      buildAnnouncement({ id: 'n-6', title: 'Read Notice', read: true }),
    ]);

    const { rendered } = renderBellWithGateway(gateway);
    render(rendered);

    fireEvent.click(await screen.findByRole('button', { name: /notifications/i }));

    // Both are visible under "All"
    expect(await screen.findByText('Unread Notice')).toBeInTheDocument();
    expect(screen.getByText('Read Notice')).toBeInTheDocument();

    // Click "Unread" tab
    const unreadTab = screen.getByRole('tab', { name: /unread/i });
    fireEvent.click(unreadTab);

    // Wait for unread query to resolve: only unread notice is visible
    expect(await screen.findByText('Unread Notice')).toBeInTheDocument();
    expect(screen.queryByText('Read Notice')).not.toBeInTheDocument();

    // Switch back to "All" tab
    const allTab = screen.getByRole('tab', { name: /all/i });
    fireEvent.click(allTab);

    expect(await screen.findByText('Read Notice')).toBeInTheDocument();
    expect(screen.getByText('Unread Notice')).toBeInTheDocument();
  });
});
