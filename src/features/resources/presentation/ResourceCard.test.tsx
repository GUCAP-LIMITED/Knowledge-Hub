import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { buildResource } from '@testing/builders/resource.builder';
import { ResourceCard, type ResourceCardProps } from './ResourceCard';

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: () => false,
  }),
}));

const renderCard = (
  props: Pick<ResourceCardProps, 'resource'> & Partial<ResourceCardProps>,
): ReactElement => (
  <MemoryRouter>
    <ResourceCard isBusy={false} onEdit={vi.fn()} onDelete={vi.fn()} {...props} />
  </MemoryRouter>
);

describe('<ResourceCard />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the hover preview only after a deliberate hover', () => {
    const resource = buildResource({ description: 'How to submit a leave request.' });
    const { container } = render(renderCard({ resource }));
    const wrapper = container.firstChild as HTMLElement;

    expect(screen.queryByText('View resource')).not.toBeInTheDocument();

    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('View resource')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('View resource')).not.toBeInTheDocument();
  });

  it('renders rating stars, helpful count, and category', () => {
    const resource = buildResource({
      title: 'Enterprise Architecture Playbook',
      category: 'Architecture',
      helpful: 42,
      rating: 4.8,
      totalReviews: 19,
      isCompleted: false,
    });

    render(renderCard({ resource }));

    expect(screen.getByText('Enterprise Architecture Playbook')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(19)')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });

  it('renders "Completed" status badge when isCompleted is true', () => {
    const resource = buildResource({
      title: 'Completed Security Checklist',
      isCompleted: true,
      helpful: 15,
      rating: 5.0,
      totalReviews: 4,
    });

    render(renderCard({ resource }));

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders 0 helpful and 0.0 rating when values are zero', () => {
    const resource = buildResource({
      helpful: 0,
      rating: 0,
      totalReviews: 0,
    });

    render(renderCard({ resource }));

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('renders visibility badge when set to Team or Private', () => {
    const resource = buildResource({
      visibility: 'Team',
    });

    render(renderCard({ resource }));

    expect(screen.getByText('Team')).toBeInTheDocument();
  });
});
