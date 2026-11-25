import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ok } from '@core/result';
import { FakeNotificationGateway, buildAnnouncement, silentLogger } from '@testing';
import {
  createNotificationsModule,
  NotificationsModuleProvider,
} from '@features/notifications';
import type { WidgetData } from '../../../domain';
import { NotificationsRecentWidgetView } from './NotificationsRecentWidgetView';

const renderWithProviders = (
  ui: ReactElement,
  gateway: FakeNotificationGateway,
): { queryClient: QueryClient } => {
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
    },
    markAnnouncementRead: {
      execute: (id: string) => gateway.markRead(id),
    },
    markAllRead: {
      execute: () => gateway.markAllRead(),
    },
  };

  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationsModuleProvider module={mockModule as unknown as typeof module}>
          {ui}
        </NotificationsModuleProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );

  return { queryClient };
};

describe('<NotificationsRecentWidgetView />', () => {
  it('renders empty state when there are no notifications', () => {
    const gateway = new FakeNotificationGateway();
    const emptyData: WidgetData = {
      widgetKey: 'notifications.recent',
      kind: 'table',
      title: 'Recent notifications',
      value: 0,
      delta: null,
      series: [],
      summary: null,
    };

    renderWithProviders(<NotificationsRecentWidgetView data={emptyData} />, gateway);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders notification items with title, message, and timestamp', () => {
    const gateway = new FakeNotificationGateway();
    const sampleData: WidgetData = {
      widgetKey: 'notifications.recent',
      kind: 'table',
      title: 'Recent notifications',
      value: 2,
      delta: 15,
      series: [
        {
          label: 'Assignment Due Soon',
          value: 20,
          meta: JSON.stringify({
            id: 'n-1',
            message: 'Due in 2 days: ASP.NET Core Architecture',
            priority: 'High',
            isRead: 'false',
            creationTime: '2026-09-12T14:30:00.000Z',
          }),
        },
        {
          label: 'Course Updated',
          value: 10,
          meta: JSON.stringify({
            id: 'n-2',
            message: 'New content added to React Masterclass',
            priority: 'Normal',
            isRead: 'true',
            creationTime: '2026-09-11T10:00:00.000Z',
          }),
        },
      ],
      summary: JSON.stringify({
        periodTotal: 2,
        periodUnread: 1,
        totalUnread: 1,
      }),
    };

    renderWithProviders(<NotificationsRecentWidgetView data={sampleData} />, gateway);

    expect(screen.getByText('Assignment Due Soon')).toBeInTheDocument();
    expect(
      screen.getByText('Due in 2 days: ASP.NET Core Architecture'),
    ).toBeInTheDocument();
    expect(screen.getByText('Course Updated')).toBeInTheDocument();
    expect(
      screen.getByText('New content added to React Masterclass'),
    ).toBeInTheDocument();

    // Unread count badge and "New" label
    expect(screen.getByText('1 new')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('calls markRead when an unread notification item is clicked', async () => {
    const gateway = new FakeNotificationGateway();
    gateway.markReadResult = ok(buildAnnouncement({ id: 'n-1', read: true }));

    const sampleData: WidgetData = {
      widgetKey: 'notifications.recent',
      kind: 'table',
      title: 'Recent notifications',
      value: 1,
      delta: null,
      series: [
        {
          label: 'Quiz Grading Complete',
          value: 15,
          meta: JSON.stringify({
            id: 'n-1',
            message: 'Your quiz was evaluated',
            priority: 'Medium',
            isRead: 'false',
            creationTime: '2026-09-12T14:00:00.000Z',
          }),
        },
      ],
      summary: JSON.stringify({ periodUnread: 1 }),
    };

    renderWithProviders(<NotificationsRecentWidgetView data={sampleData} />, gateway);

    const itemBtn = screen.getByRole('button', { name: /Quiz Grading Complete/i });
    fireEvent.click(itemBtn);

    await waitFor(() => {
      expect(gateway.lastReadId).toBe('n-1');
    });
  });

  it('calls markAllRead when "Mark all read" button is clicked', async () => {
    const gateway = new FakeNotificationGateway();
    const markAllSpy = vi
      .spyOn(gateway, 'markAllRead')
      .mockReturnValue(Promise.resolve(ok([])));

    const sampleData: WidgetData = {
      widgetKey: 'notifications.recent',
      kind: 'table',
      title: 'Recent notifications',
      value: 1,
      delta: null,
      series: [
        {
          label: 'Platform Announcement',
          value: 10,
          meta: JSON.stringify({
            id: 'n-1',
            message: 'Welcome to the platform',
            isRead: 'false',
          }),
        },
      ],
      summary: JSON.stringify({ periodUnread: 1 }),
    };

    renderWithProviders(<NotificationsRecentWidgetView data={sampleData} />, gateway);

    const markAllBtn = screen.getByRole('button', { name: /Mark all read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(markAllSpy).toHaveBeenCalled();
    });
  });

  it('renders well-formatted topic tags as badges', () => {
    const gateway = new FakeNotificationGateway();
    const sampleData: WidgetData = {
      widgetKey: 'notifications.recent',
      kind: 'table',
      title: 'Recent notifications',
      value: 1,
      delta: null,
      series: [
        {
          label: 'Revision Submitted: "Nam qui"',
          value: 10,
          meta: JSON.stringify({
            id: 'n-1',
            message: 'Your proposed updates have been submitted for review.',
            topicId: 'ContentSubmission',
            isRead: 'false',
            creationTime: '2026-09-28T09:50:00.000Z',
          }),
        },
      ],
      summary: JSON.stringify({ periodUnread: 1 }),
    };

    renderWithProviders(<NotificationsRecentWidgetView data={sampleData} />, gateway);

    // Verify well-formatted topic tag is rendered
    expect(screen.getByText('Content Submission')).toBeInTheDocument();
  });
});
