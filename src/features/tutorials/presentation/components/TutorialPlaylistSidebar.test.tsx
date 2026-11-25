import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { TutorialVideo } from '../../domain';
import { TutorialPlaylistSidebar } from './TutorialPlaylistSidebar';

const mockVideos: readonly TutorialVideo[] = [
  {
    id: 'v1',
    originalFileName: '01_Introduction.mp4',
    durationSeconds: 120,
    displayOrder: 0,
    isMediaCompleted: false,
  },
  {
    id: 'v2',
    originalFileName: '02_Architecture.mp4',
    durationSeconds: 240,
    displayOrder: 1,
    isMediaCompleted: false,
  },
  {
    id: 'v3',
    originalFileName: '03_Deployment.mp4',
    durationSeconds: 180,
    displayOrder: 2,
    isMediaCompleted: false,
  },
];

describe('<TutorialPlaylistSidebar />', () => {
  it('renders "Paused" badge when the active video is paused (isPlaying = false)', () => {
    render(
      <TutorialPlaylistSidebar
        videos={mockVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={vi.fn()}
      />,
    );

    // Active item (v1) should show Paused badge
    expect(screen.getByText('Paused')).toBeInTheDocument();
    // It should NOT show Playing
    expect(screen.queryByText('Playing')).not.toBeInTheDocument();
    // Equalizer icon should NOT be visible
    expect(screen.queryByTitle('Playing')).not.toBeInTheDocument();
  });

  it('renders "Playing" badge and animated equalizer when the active video is playing (isPlaying = true)', () => {
    render(
      <TutorialPlaylistSidebar
        videos={mockVideos}
        activeVideoId="v1"
        isPlaying={true}
        onSelectVideo={vi.fn()}
      />,
    );

    // Active item (v1) should show Playing badge and equalizer
    expect(screen.getByText('Playing')).toBeInTheDocument();
    expect(screen.getByTitle('Playing')).toBeInTheDocument();
    // It should NOT show Paused
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('renders "Watched" badge for inactive completed videos and "Paused" for active completed video when paused', () => {
    const completedMockVideos: readonly TutorialVideo[] = mockVideos.map(
      (video, idx) => ({
        ...video,
        isMediaCompleted: idx < 2,
      }),
    );

    render(
      <TutorialPlaylistSidebar
        videos={completedMockVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={vi.fn()}
      />,
    );

    // Active item v1 is paused, so it shows Paused
    expect(screen.getByText('Paused')).toBeInTheDocument();
    // Inactive completed item v2 should show Watched badge
    expect(screen.getByText('Watched')).toBeInTheDocument();
    // Completion progress calculation: 2 of 3 completed · 67%
    expect(screen.getByText('2 of 3 completed · 67%')).toBeInTheDocument();
  });

  it('calls onSelectVideo when clicking a playlist item', () => {
    const handleSelect = vi.fn();
    render(
      <TutorialPlaylistSidebar
        videos={mockVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={handleSelect}
      />,
    );

    const secondVideo = screen.getByRole('button', { name: /02_Architecture\.mp4/i });
    fireEvent.click(secondVideo);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockVideos[1]);
  });

  it('renders formatted duration and falls back to --:-- when duration is 0 or unmeasured', () => {
    const unmeasuredVideos: readonly TutorialVideo[] = [
      {
        id: 'v1',
        originalFileName: 'part1.mp4',
        durationSeconds: 66,
        displayOrder: 0,
        isMediaCompleted: false,
      },
      {
        id: 'v2',
        originalFileName: 'part2.mp4',
        durationSeconds: 0,
        displayOrder: 1,
        isMediaCompleted: false,
      },
    ];

    render(
      <TutorialPlaylistSidebar
        videos={unmeasuredVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={vi.fn()}
      />,
    );

    expect(screen.getByText('01:06')).toBeInTheDocument();
    expect(screen.getByText('--:--')).toBeInTheDocument();
    expect(screen.queryByText('00:00')).not.toBeInTheDocument();
  });

  it('renders autoplay toggle and fires onToggleAutoplay callback', () => {
    const handleToggle = vi.fn();
    render(
      <TutorialPlaylistSidebar
        videos={mockVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={vi.fn()}
        autoplayEnabled={true}
        onToggleAutoplay={handleToggle}
      />,
    );

    expect(screen.getByText('Autoplay')).toBeInTheDocument();
    const switchBtn = screen.getByRole('switch', { name: /autoplay next video/i });
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(switchBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith(false);
  });

  it('renders AutoplayTransitionCard and handles Play Now and Cancel', () => {
    const handlePlayNow = vi.fn();
    const handleCancel = vi.fn();

    render(
      <TutorialPlaylistSidebar
        videos={mockVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={vi.fn()}
        autoplayEnabled={true}
        autoplayCountdown={3}
        autoplayNextVideoId="v2"
        onPlayNextNow={handlePlayNow}
        onCancelAutoplay={handleCancel}
      />,
    );

    expect(screen.getByText('Up Next in 3s')).toBeInTheDocument();
    const playBtn = screen.getByRole('button', { name: /play next video now/i });
    const cancelBtn = screen.getByRole('button', { name: /cancel autoplay/i });

    fireEvent.click(playBtn);
    expect(handlePlayNow).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('renders Saving... badge on active item when isAutoplaySaving is true', () => {
    render(
      <TutorialPlaylistSidebar
        videos={mockVideos}
        activeVideoId="v1"
        isPlaying={false}
        onSelectVideo={vi.fn()}
        isAutoplaySaving={true}
      />,
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
