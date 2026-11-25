import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { WidgetData } from '../../../domain';
import { ActionCardWidgetView } from './ActionCardWidgetView';

describe('<ActionCardWidgetView />', () => {
  it('renders review queue action with route and waiting count', () => {
    const data: WidgetData = {
      widgetKey: 'action.review-queue',
      kind: 'kpi',
      title: 'Review Queue',
      description: '4 items waiting',
      route: '/approvals',
      value: 4,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /review queue: 4 items waiting/i });
    expect(link).toHaveAttribute('href', '/approvals');
    expect(screen.getByText('Review Queue')).toBeInTheDocument();
    expect(screen.getByText('4 items waiting')).toBeInTheDocument();
  });

  it('renders manage content action with route /courses', () => {
    const data: WidgetData = {
      widgetKey: 'action.manage-content',
      kind: 'kpi',
      title: 'Manage Content',
      description: 'Edit and publish',
      route: '/courses',
      value: 12,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /manage content: edit and publish/i });
    expect(link).toHaveAttribute('href', '/courses');
  });

  it('renders team progress action with route /team-progress', () => {
    const data: WidgetData = {
      widgetKey: 'action.team-progress',
      kind: 'kpi',
      title: 'Team Progress',
      description: 'View team analytics',
      route: '/team-progress',
      value: 8,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', {
      name: /team progress: view team analytics/i,
    });
    expect(link).toHaveAttribute('href', '/team-progress');
  });

  it('renders course reviews action with route /course-reviews', () => {
    const data: WidgetData = {
      widgetKey: 'action.course-reviews',
      kind: 'kpi',
      title: 'Course Reviews',
      description: 'See all feedback',
      route: '/course-reviews',
      value: 20,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /course reviews: see all feedback/i });
    expect(link).toHaveAttribute('href', '/course-reviews');
  });

  it('renders non-interactive container without navigation link in edit mode', () => {
    const data: WidgetData = {
      widgetKey: 'action.review-queue',
      kind: 'kpi',
      title: 'Review Queue',
      description: '4 items waiting',
      route: '/approvals',
      value: 4,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} isEditMode={true} />
      </MemoryRouter>,
    );

    // In edit mode, it shouldn't be a clickable link
    expect(
      screen.queryByRole('link', { name: /review queue: 4 items waiting/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/review queue: 4 items waiting/i)).toBeInTheDocument();
  });

  it('renders non-interactive container without navigation link when route is missing', () => {
    const data: WidgetData = {
      widgetKey: 'action.review-queue',
      kind: 'kpi',
      title: 'Review Queue',
      description: '4 items waiting',
      value: 4,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('link', { name: /review queue: 4 items waiting/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/review queue: 4 items waiting/i)).toBeInTheDocument();
  });

  it('passes fromDashboardAction state when link is clicked', async () => {
    const user = userEvent.setup();
    let currentLocationState: unknown = null;

    const LocationTracker = (): ReactElement => {
      const location = useLocation();
      currentLocationState = location.state;
      return <div data-testid="target-page">Target Page</div>;
    };

    const data: WidgetData = {
      widgetKey: 'action.review-queue',
      kind: 'kpi',
      title: 'Review Queue',
      description: '4 items waiting',
      route: '/approvals',
      value: 4,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ActionCardWidgetView data={data} />} />
          <Route path="/approvals" element={<LocationTracker />} />
        </Routes>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /review queue: 4 items waiting/i });
    await user.click(link);

    expect(screen.getByTestId('target-page')).toBeInTheDocument();
    expect(currentLocationState).toEqual({ fromDashboardAction: true });
  });

  it('navigates to backend-provided route when present', () => {
    const data: WidgetData = {
      widgetKey: 'action.review-queue',
      kind: 'kpi',
      title: 'Review Queue',
      description: '4 items waiting',
      route: '/custom-queue',
      value: 4,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /review queue: 4 items waiting/i });
    expect(link).toHaveAttribute('href', '/custom-queue');
  });

  it('renders an external link when route is an absolute URL', () => {
    const data: WidgetData = {
      widgetKey: 'action.manage-content',
      kind: 'kpi',
      title: 'Manage Content',
      description: 'External portal',
      route: 'https://example.com/courses',
      value: 10,
      delta: null,
      series: [],
      summary: null,
    };

    render(
      <MemoryRouter>
        <ActionCardWidgetView data={data} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /manage content: external portal/i });
    expect(link).toHaveAttribute('href', 'https://example.com/courses');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
