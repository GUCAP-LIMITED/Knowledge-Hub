import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { MyLearningItem } from '../domain/entities/my-learning-item';
import { MyLearningCardPreview } from './MyLearningCardPreview';

const createItem = (
  overrides?: Partial<ConstructorParameters<typeof MyLearningItem>[0]>,
): MyLearningItem =>
  new MyLearningItem({
    id: 'item-1',
    assignmentId: null,
    enrollmentId: 'enroll-1',
    certificateId: null,
    certificateUrl: null,
    title: 'Modern Architecture in ABP',
    subtitle: 'Learn clean code and DDD patterns',
    description: 'A deep dive into architecture',
    contentType: 'course',
    contentTypeName: 'Course',
    origin: 'self',
    originName: 'Self-Enrolled',
    assignedScope: null,
    assignedScopeName: null,
    status: 'inProgress',
    statusName: 'In Progress',
    progress: 40,
    dueDate: null,
    isOverdue: false,
    daysRemaining: null,
    enrolledOrAssignedAt: new Date('2026-09-01'),
    lastAccessedAt: new Date('2026-09-05'),
    completedAt: null,
    totalLessons: 8,
    completedLessons: 3,
    durationSeconds: 3600,
    difficultyName: 'Intermediate',
    categoryName: 'Architecture',
    topic: 'Software Architecture',
    thumbnailUrl: null,
    actionLabel: 'Resume Learning',
    helpfulCount: 42,
    rating: 4.8,
    totalReviews: 15,
    ...overrides,
  });

const LocationProbe = (): ReactElement => {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
};

describe('<MyLearningCardPreview />', () => {
  it('renders the title, subtitle, meta line, description, and action button', () => {
    const item = createItem();

    render(
      <MemoryRouter>
        <MyLearningCardPreview item={item} side="right" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Modern Architecture in ABP')).toBeInTheDocument();
    expect(screen.getByText('Learn clean code and DDD patterns')).toBeInTheDocument();
    expect(screen.getByText('Course · Intermediate · 1h 0m')).toBeInTheDocument();
    expect(screen.getByText('A deep dive into architecture')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume Learning' })).toBeInTheDocument();
  });

  it('omits the subtitle when none is provided', () => {
    const item = createItem({ subtitle: null });

    render(
      <MemoryRouter>
        <MyLearningCardPreview item={item} side="left" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Modern Architecture in ABP')).toBeInTheDocument();
    expect(
      screen.queryByText('Learn clean code and DDD patterns'),
    ).not.toBeInTheDocument();
  });

  it('navigates to course route when action CTA is clicked', () => {
    const item = createItem({ id: 'course-123' });

    render(
      <MemoryRouter initialEntries={['/my-learning']}>
        <MyLearningCardPreview item={item} side="right" />
        <LocationProbe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Resume Learning' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/courses/course-123');
  });
});
