import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { buildTutorial } from '@testing';
import { TutorialWatchContent } from './TutorialWatch';

// Mock child playback viewer & review panels to isolate watch content logic
vi.mock('@features/playback', () => ({
  PlaybackMediaViewer: () => <div data-testid="playback-viewer" />,
}));
const mockContentReviewsPanel = vi.fn();
const mockMarkVideoComplete = vi.fn();
vi.mock('@features/course-reviews', () => ({
  ContentReviewsPanel: (props: unknown) => {
    mockContentReviewsPanel(props);
    return <div data-testid="reviews-panel" />;
  },
}));
vi.mock('@features/tutorials', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useMarkTutorialHelpful: () => ({
      isPending: false,
      mutate: vi.fn(),
    }),
    useMarkTutorialComplete: () => ({
      isPending: false,
      mutate: vi.fn(),
    }),
    useMarkVideoComplete: () => ({
      isPending: false,
      mutate: mockMarkVideoComplete,
      mutateAsync: vi.fn().mockResolvedValue({}),
    }),
  };
});

const mockUseQuizLearnerStatus = vi.fn();

vi.mock('@features/quizzes', () => ({
  QuizRunner: ({
    onPassed,
    onResultChange,
  }: {
    readonly onPassed?: (() => void) | undefined;
    readonly onResultChange?: ((result: { passed: boolean } | null) => void) | undefined;
  }) => (
    <div data-testid="quiz-runner">
      <button
        type="button"
        onClick={() => {
          onPassed?.();
          onResultChange?.({ passed: true });
        }}
      >
        Pass Quiz
      </button>
      <button
        type="button"
        onClick={() => {
          onResultChange?.({ passed: false });
        }}
      >
        Fail Quiz
      </button>
    </div>
  ),
  useQuizLearnerStatus: (quizId: string | null): unknown =>
    mockUseQuizLearnerStatus(quizId),
}));

describe('<TutorialWatchContent />', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    mockContentReviewsPanel.mockClear();
    mockUseQuizLearnerStatus.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  it('renders View certificate button and calls onViewCertificate when clicked', async () => {
    const user = userEvent.setup();
    const handleViewCertificate = vi.fn();
    const tutorial = buildTutorial({
      completed: true,
      certificateId: 'cert-tutorial-1',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          hasCertificate={true}
          onViewCertificate={handleViewCertificate}
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Tutorial completed!')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /View certificate/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName.toLowerCase()).toBe('button');
    expect(button).not.toHaveAttribute('target');
    expect(button).not.toHaveAttribute('href');

    await user.click(button);
    expect(handleViewCertificate).toHaveBeenCalledTimes(1);
  });

  it('does not render certificate banner when tutorial is not completed without certificate', () => {
    const tutorial = buildTutorial({
      completed: false,
      certificateId: null,
      certificateUrl: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          hasCertificate={false}
          onViewCertificate={vi.fn()}
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText('Tutorial completed!')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /View certificate/i }),
    ).not.toBeInTheDocument();
  });

  it('renders multi-video playlist sidebar and controls when tutorial has multiple videos', () => {
    const tutorial = buildTutorial({
      completed: false,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
        {
          id: 'v2',
          originalFileName: '02_Architecture.mp4',
          durationSeconds: 240,
          displayOrder: 1,
          isMediaCompleted: false,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Tutorial Playlist')).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 completed/i)).toBeInTheDocument();
    expect(screen.getByText('01_Introduction.mp4')).toBeInTheDocument();
    expect(screen.getAllByText('02_Architecture.mp4').length).toBe(2);
    expect(screen.getByText(/Part 2 of 2/i)).toBeInTheDocument();
  });

  it('auto-collapses playlist sidebar when tutorial has only 1 video', () => {
    const tutorial = buildTutorial({
      completed: false,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText('Tutorial Playlist')).not.toBeInTheDocument();
  });

  it('renders Locked quiz tab when required quiz has uncompleted videos', () => {
    const tutorial = buildTutorial({
      completed: false,
      quizId: 'quiz-1',
      isQuizRequired: true,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
        {
          id: 'v2',
          originalFileName: '02_Advanced.mp4',
          durationSeconds: 180,
          displayOrder: 1,
          isMediaCompleted: false,
        },
      ], // only 1 of 2 completed
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="quiz"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('tab', { name: 'Quiz Assessment' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: 'Quiz Assessment' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 videos watched/i)).toBeInTheDocument();
  });

  it('renders Quiz Submission Required banner when quiz assessment is unlocked and not passed yet', () => {
    const tutorial = buildTutorial({
      completed: false,
      quizId: 'quiz-1',
      isQuizRequired: true,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="quiz"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Quiz Submission Required')).toBeInTheDocument();
    expect(
      screen.getByText(/All tutorial videos completed! Submit and pass this quiz/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('quiz-runner')).toBeInTheDocument();
  });

  it('does not render Quiz Submission Required banner when quiz is already passed in learner status', () => {
    mockUseQuizLearnerStatus.mockReturnValue({
      data: {
        status: 'passed',
        hasEverPassed: true,
        attemptCount: 1,
        versionAttemptCount: 1,
        canAttempt: true,
        isQuizUpdatedSinceLastAttempt: false,
        latestResult: { passed: true },
        latestAnswers: null,
      },
      isLoading: false,
    });

    const tutorial = buildTutorial({
      completed: false,
      quizId: 'quiz-1',
      isQuizRequired: true,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="quiz"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText('Quiz Submission Required')).not.toBeInTheDocument();
    expect(screen.getByTestId('quiz-runner')).toBeInTheDocument();
  });

  it('does not render Quiz Submission Required banner when quiz was already passed', () => {
    mockUseQuizLearnerStatus.mockReturnValue({
      data: {
        status: 'passed',
        hasEverPassed: true,
        attemptCount: 1,
        versionAttemptCount: 1,
        canAttempt: true,
        isQuizUpdatedSinceLastAttempt: false,
        latestResult: { passed: true },
        latestAnswers: null,
      },
      isLoading: false,
    });

    const tutorial = buildTutorial({
      completed: true,
      quizId: 'quiz-1',
      isQuizRequired: true,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="quiz"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText('Quiz Submission Required')).not.toBeInTheDocument();
  });

  it('keeps Quiz Submission Required banner visible when quiz attempt fails', async () => {
    const user = userEvent.setup();
    const tutorial = buildTutorial({
      completed: false,
      quizId: 'quiz-1',
      isQuizRequired: true,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="quiz"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Quiz Submission Required')).toBeInTheDocument();

    const failButton = screen.getByRole('button', { name: /Fail Quiz/i });
    await user.click(failButton);

    // Banner must remain visible on failed attempts until passed!
    expect(screen.getByText('Quiz Submission Required')).toBeInTheDocument();
  });

  it('hides Quiz Submission Required banner immediately and triggers onQuizPassed when user passes quiz', async () => {
    const user = userEvent.setup();
    const handleQuizPassed = vi.fn();
    const tutorial = buildTutorial({
      completed: false,
      quizId: 'quiz-1',
      isQuizRequired: true,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
          isMediaCompleted: true,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="quiz"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
          onQuizPassed={handleQuizPassed}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Quiz Submission Required')).toBeInTheDocument();

    const passButton = screen.getByRole('button', { name: /Pass Quiz/i });
    await user.click(passButton);

    expect(screen.queryByText('Quiz Submission Required')).not.toBeInTheDocument();
    expect(handleQuizPassed).toHaveBeenCalledTimes(1);
  });

  it('renders playlist with Autoplay toggle enabled by default in multi-video tutorial', () => {
    const tutorial = buildTutorial({
      completed: false,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
        },
        {
          id: 'v2',
          originalFileName: '02_Architecture.mp4',
          durationSeconds: 240,
          displayOrder: 1,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Tutorial Playlist')).toBeInTheDocument();
    expect(screen.getByText('Autoplay')).toBeInTheDocument();
    const autoplaySwitch = screen.getByRole('switch', {
      name: /autoplay next video/i,
    });
    expect(autoplaySwitch).toBeInTheDocument();
    expect(autoplaySwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('passes canReview=false to ContentReviewsPanel when tutorial is not completed', () => {
    const tutorial = buildTutorial({
      completed: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(mockContentReviewsPanel).toHaveBeenCalledWith(
      expect.objectContaining({ canReview: false }),
    );
  });

  it('passes canReview=true to ContentReviewsPanel when tutorial is completed', () => {
    const tutorial = buildTutorial({
      completed: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          onTabChange={vi.fn()}
          onEnded={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(mockContentReviewsPanel).toHaveBeenCalledWith(
      expect.objectContaining({ canReview: true }),
    );
  });

  it('single-video tutorial mark completed button calls onEnded without firing markVideoComplete', async () => {
    const user = userEvent.setup();
    const handleEnded = vi.fn();
    const tutorial = buildTutorial({
      completed: false,
      videos: [
        {
          id: 'v1',
          originalFileName: '01_Introduction.mp4',
          durationSeconds: 120,
          displayOrder: 0,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TutorialWatchContent
          tutorial={tutorial}
          activeTab="video"
          onTabChange={vi.fn()}
          onEnded={handleEnded}
        />
      </QueryClientProvider>,
    );

    const button = screen.getByRole('button', { name: /mark tutorial as completed/i });
    await user.click(button);

    expect(handleEnded).toHaveBeenCalledTimes(1);
    expect(mockMarkVideoComplete).not.toHaveBeenCalled();
  });
});
