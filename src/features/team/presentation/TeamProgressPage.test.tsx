import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TeamMember, TeamProgressOverview } from '../domain';
import { AtRiskPanel, ProgressDistribution } from './TeamInsights';
import { TeamProgressPage } from './TeamProgressPage';

interface TeamProgressQueryResultMock {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly data?: TeamProgressOverview;
}

interface InfiniteQueryResultMock {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly data?:
    | {
        pages: {
          totalCount: number;
          items: TeamMember[];
        }[];
      }
    | undefined;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => void;
}

const mockUseTeamProgressOverview = vi.fn<() => TeamProgressQueryResultMock>();
const mockUseInfiniteTeamMembers = vi.fn<() => InfiniteQueryResultMock>();
const mockUseInfiniteAtRiskMembers = vi.fn<() => InfiniteQueryResultMock>();

vi.mock('./use-team', () => ({
  useTeamProgressOverview: (): TeamProgressQueryResultMock =>
    mockUseTeamProgressOverview(),
  useInfiniteTeamMembers: (): InfiniteQueryResultMock => mockUseInfiniteTeamMembers(),
  useInfiniteAtRiskMembers: (): InfiniteQueryResultMock => mockUseInfiniteAtRiskMembers(),
}));

const createMember = (id: string, name: string, progress: number): TeamMember =>
  new TeamMember({
    id,
    name,
    email: `${name.toLowerCase()}@example.com`,
    role: 'Learner',
    progress,
    completed: Math.floor(progress / 20),
    total: 5,
    lastActive: '1 hour ago',
    status: 'online',
  });

describe('<TeamProgressPage /> and learner list containers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseInfiniteTeamMembers.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    mockUseInfiniteAtRiskMembers.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
  });

  it('renders loading skeleton while query is loading', () => {
    mockUseTeamProgressOverview.mockReturnValue({
      isLoading: true,
      isError: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <TeamProgressPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Team Progress')).toBeInTheDocument();
    expect(screen.getByText('Track learning across your team')).toBeInTheDocument();
  });

  it('renders error alert when query fails', () => {
    mockUseTeamProgressOverview.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch team data'),
    });

    render(
      <MemoryRouter>
        <TeamProgressPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not load the team')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch team data')).toBeInTheDocument();
  });

  it('renders empty state when there are no team members', () => {
    mockUseTeamProgressOverview.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: new TeamProgressOverview({
        totalMembers: 0,
        avgProgress: 0,
        activeNow: 0,
        atRisk: 0,
        teamTotalCourses: 0,
        teamCompletedCourses: 0,
        progressDistribution: {
          risk: 0,
          progressing: 0,
          onTrack: 0,
          complete: 0,
        },
        members: [],
        atRiskMembers: [],
        certificatesEarnedDates: [],
      }),
    });

    render(
      <MemoryRouter>
        <TeamProgressPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('No team members')).toBeInTheDocument();
    expect(screen.getByText('Team members will appear here.')).toBeInTheDocument();
  });

  it('renders member table and insights with all members and at-risk learners', () => {
    const alice = createMember('m1', 'Alice Johnson', 30);
    const bob = createMember('m2', 'Bob Smith', 45);
    const carol = createMember('m3', 'Carol White', 80);
    const dave = createMember('m4', 'Dave Brown', 100);
    const members = [alice, bob, carol, dave];
    const atRiskMembers = [alice, bob];

    mockUseTeamProgressOverview.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: new TeamProgressOverview({
        totalMembers: 4,
        avgProgress: 63,
        activeNow: 2,
        atRisk: 2,
        teamTotalCourses: 20,
        teamCompletedCourses: 12,
        progressDistribution: {
          risk: 2,
          progressing: 0,
          onTrack: 1,
          complete: 1,
        },
        members,
        atRiskMembers,
        certificatesEarnedDates: [new Date()],
      }),
    });

    mockUseInfiniteTeamMembers.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        pages: [{ totalCount: 4, items: members }],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    mockUseInfiniteAtRiskMembers.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        pages: [{ totalCount: 2, items: atRiskMembers }],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TeamProgressPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Alice Johnson')).toHaveLength(2);
    expect(screen.getAllByText('Bob Smith')).toHaveLength(2);
    expect(screen.getByText('Carol White')).toBeInTheDocument();
    expect(screen.getByText('Dave Brown')).toBeInTheDocument();

    expect(screen.getByText('At-risk learners')).toBeInTheDocument();
    expect(screen.getByText('Progress distribution')).toBeInTheDocument();
  });
});

describe('<AtRiskPanel /> and <ProgressDistribution />', () => {
  it('renders on-track state when atRiskMembers is empty', () => {
    render(<AtRiskPanel atRiskMembers={[]} totalCount={0} />);
    expect(screen.getByText('Everyone’s on track')).toBeInTheDocument();
    expect(screen.getByText(/No learners are below 50% completion/i)).toBeInTheDocument();
  });

  it('renders multiple at-risk learners within the at-risk panel', () => {
    const learners = [
      createMember('l1', 'Learner One', 15),
      createMember('l2', 'Learner Two', 25),
      createMember('l3', 'Learner Three', 40),
      createMember('l4', 'Learner Four', 45),
      createMember('l5', 'Learner Five', 48),
    ];

    render(<AtRiskPanel atRiskMembers={learners} totalCount={5} />);

    expect(screen.getByText('At-risk learners')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    for (const learner of learners) {
      expect(screen.getByText(learner.name)).toBeInTheDocument();
    }
  });

  it('renders progress distribution band counts from backend data', () => {
    const distribution = {
      risk: 2,
      progressing: 1,
      onTrack: 3,
      complete: 4,
    };

    render(<ProgressDistribution distribution={distribution} />);

    expect(screen.getByText('Progress distribution')).toBeInTheDocument();
    expect(screen.getByText('At risk (0–49%)')).toBeInTheDocument();
    expect(screen.getByText('Progressing (50–74%)')).toBeInTheDocument();
    expect(screen.getByText('On track (75–99%)')).toBeInTheDocument();
    expect(screen.getByText('Complete (100%)')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
