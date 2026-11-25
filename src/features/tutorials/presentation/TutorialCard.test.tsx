import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { buildTutorial } from '@testing';
import { TutorialCard } from './TutorialCard';

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: () => false,
  }),
}));

describe('<TutorialCard />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the hover preview only after a deliberate hover', () => {
    const tutorial = buildTutorial({
      description: 'Create and enrol a new student record.',
    });
    const { container } = render(
      <MemoryRouter>
        <TutorialCard
          tutorial={tutorial}
          isBusy={false}
          onWatch={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>,
    );
    const wrapper = container.firstChild as HTMLElement;

    expect(screen.queryByText('Watch tutorial')).not.toBeInTheDocument();

    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Watch tutorial')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Watch tutorial')).not.toBeInTheDocument();
  });

  it('renders "Quiz Required" badge when isQuizRequired is true', () => {
    const tutorial = buildTutorial({
      title: 'Tutorial with Required Quiz',
      quizId: 'quiz-req-1',
      isQuizRequired: true,
    });

    render(
      <TutorialCard
        tutorial={tutorial}
        isBusy={false}
        onWatch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Quiz Required')).toBeInTheDocument();
  });

  it('renders "Quiz Included" badge when isQuizRequired is false', () => {
    const tutorial = buildTutorial({
      title: 'Tutorial with Optional Quiz',
      quizId: 'quiz-opt-1',
      isQuizRequired: false,
    });

    render(
      <TutorialCard
        tutorial={tutorial}
        isBusy={false}
        onWatch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Quiz Included')).toBeInTheDocument();
  });

  it('renders no quiz badge when quizId is not present', () => {
    const tutorial = buildTutorial({
      title: 'Tutorial without Quiz',
      quizId: null,
      isQuizRequired: false,
    });

    render(
      <TutorialCard
        tutorial={tutorial}
        isBusy={false}
        onWatch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByText('Quiz Required')).not.toBeInTheDocument();
    expect(screen.queryByText('Quiz Included')).not.toBeInTheDocument();
  });

  it('renders Completed status badge, 1 lesson, rating stars, and helpful count', () => {
    const tutorial = buildTutorial({
      title: 'Advanced Git Workflows',
      completed: true,
      helpfulCount: 28,
      rating: 4.7,
      totalReviews: 9,
    });

    render(
      <TutorialCard
        tutorial={tutorial}
        isBusy={false}
        onWatch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('1 lesson')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('(9)')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
  });

  it('renders 0 helpful when helpfulCount is 0', () => {
    const tutorial = buildTutorial({
      helpfulCount: 0,
      rating: 0,
      totalReviews: 0,
    });

    render(
      <TutorialCard
        tutorial={tutorial}
        isBusy={false}
        onWatch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });
});
