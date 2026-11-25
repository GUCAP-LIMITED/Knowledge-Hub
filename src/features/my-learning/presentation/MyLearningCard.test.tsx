import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyLearningItem } from '../domain/entities/my-learning-item';
import { MyLearningCard, type MyLearningCardProps } from './MyLearningCard';

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
    subtitle: 'Learn clean code',
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

const renderCard = (props: MyLearningCardProps): ReactElement => (
  <MemoryRouter>
    <MyLearningCard {...props} />
  </MemoryRouter>
);

describe('<MyLearningCard />', () => {
  it('renders status badge, rating stars, helpful count, and lessons count', () => {
    const item = createItem();

    render(renderCard({ item }));

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('8 lessons')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(15)')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('renders progress bar for course even when progress is 0%', () => {
    const item = createItem({
      progress: 0,
      status: 'notStarted',
      statusName: 'Not Started',
    });

    render(renderCard({ item }));

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders "Completed" banner when item is completed', () => {
    const item = createItem({
      status: 'completed',
      statusName: 'Completed',
      progress: 100,
      completedAt: new Date(),
    });

    render(renderCard({ item }));

    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
  });

  it('renders 1 lesson for tutorial items', () => {
    const item = createItem({
      contentType: 'tutorial',
      contentTypeName: 'Tutorial',
      totalLessons: 1,
      actionLabel: 'Start Tutorial',
    });

    render(renderCard({ item }));

    expect(screen.getByText('1 lesson')).toBeInTheDocument();
  });

  it('handles interactive action button click when provided', () => {
    const onActionClick = vi.fn();
    const item = createItem();

    render(renderCard({ item, onActionClick }));

    const button = screen.getByRole('button', { name: 'Resume Learning' });
    button.click();

    expect(onActionClick).toHaveBeenCalledWith(item);
  });

  it('resolves correct route and renders lazy-loaded image when thumbnailUrl is provided', () => {
    const item = createItem({
      thumbnailUrl: 'https://storage.azure.com/thumbs/sample.webp',
    });

    render(renderCard({ item }));

    const titleLink = screen.getByRole('link', { name: item.title });
    expect(titleLink).toHaveAttribute('href', `/courses/${item.id}`);

    const img = screen.getByAltText(item.title);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://storage.azure.com/thumbs/sample.webp');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders a Certificate action for a completed item that has one', () => {
    const item = createItem({
      status: 'completed',
      statusName: 'Completed',
      progress: 100,
      completedAt: new Date(),
      certificateId: 'cert-1',
    });

    render(renderCard({ item }));

    expect(screen.getByRole('button', { name: /Certificate/ })).toBeInTheDocument();
  });

  it('renders an Archived badge when published content is out of the caller scope', () => {
    const item = createItem({ isAccessible: false, isPublished: true });

    render(renderCard({ item }));

    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders a Restricted badge when the content is unpublished', () => {
    const item = createItem({
      status: 'completed',
      statusName: 'Completed',
      progress: 100,
      completedAt: new Date(),
      certificateId: 'cert-1',
      isAccessible: false,
      isPublished: false,
    });

    render(renderCard({ item }));

    expect(screen.getByText('Restricted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Certificate/ })).toBeInTheDocument();
  });

  it('renders rich-text HTML description safely with sanitization', () => {
    const item = createItem({
      description:
        '<b><i><u>A Brief History of Time.</u></i></b><script>alert(1)</script>',
    });

    const { container } = render(renderCard({ item }));

    const boldElement = container.querySelector('b');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement?.textContent).toBe('A Brief History of Time.');
    expect(container.querySelector('script')).not.toBeInTheDocument();
  });
});
