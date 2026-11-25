import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { buildCourse } from '@testing';
import { CourseCard, type CourseCardProps } from './CourseCard';

vi.mock('@features/content', () => ({
  CONTENT_DIFFICULTY: { Beginner: 0, Intermediate: 5, Advanced: 10 },
  useContentCategories: () => ({ data: [] }),
  useContentDetail: () => ({ data: undefined }),
}));

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({ can: () => false }),
}));

const renderCard = (props: CourseCardProps): ReactElement => (
  <MemoryRouter>
    <CourseCard {...props} />
  </MemoryRouter>
);

describe('<CourseCard />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the hover preview only after a deliberate hover', () => {
    const course = buildCourse({ outcomes: ['Build a real project end to end'] });
    const { container } = render(
      renderCard({
        course,
        isBusy: false,
        onAdvance: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );
    const wrapper = container.firstChild as HTMLElement;

    expect(screen.queryByText('Build a real project end to end')).not.toBeInTheDocument();

    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Build a real project end to end')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Build a real project end to end')).not.toBeInTheDocument();
  });

  it('stays open when the mouse briefly leaves before reaching the preview', () => {
    const course = buildCourse({ outcomes: ['Build a real project end to end'] });
    const { container } = render(
      renderCard({
        course,
        isBusy: false,
        onAdvance: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );
    const wrapper = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.mouseLeave(wrapper);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Build a real project end to end')).toBeInTheDocument();
  });

  it('does not show the preview before the hover delay elapses', () => {
    const course = buildCourse({ outcomes: ['Build a real project end to end'] });
    const { container } = render(
      renderCard({
        course,
        isBusy: false,
        onAdvance: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );
    const wrapper = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByText('Build a real project end to end')).not.toBeInTheDocument();
  });

  it('renders status badge, rating stars, pluralized lessons count, and helpful count', () => {
    const course = buildCourse({
      lessons: 12,
      rating: 4.6,
      totalReviews: 18,
      helpfulCount: 35,
      isEnrolled: true,
      progress: 45,
      completed: false,
    });

    render(
      renderCard({
        course,
        isBusy: false,
        onAdvance: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('12 lessons')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('(18)')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('renders "Completed" status badge when completed', () => {
    const course = buildCourse({
      lessons: 1,
      isEnrolled: true,
      progress: 100,
      completed: true,
    });

    render(
      renderCard({
        course,
        isBusy: false,
        onAdvance: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );

    expect(screen.getAllByText('Completed')).toHaveLength(3);
    expect(screen.getByText('1 lesson')).toBeInTheDocument();
  });
});
