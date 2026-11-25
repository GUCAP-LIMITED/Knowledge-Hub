import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTutorialAutoplay } from './use-tutorial-autoplay';
import type { TutorialVideo } from '../domain';

const mockVideo1: TutorialVideo = {
  id: 'v1',
  originalFileName: '01_Intro.mp4',
  durationSeconds: 120,
  displayOrder: 0,
};

const mockVideo2: TutorialVideo = {
  id: 'v2',
  originalFileName: '02_DeepDive.mp4',
  durationSeconds: 300,
  displayOrder: 1,
};

describe('useTutorialAutoplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults isEnabled to true (ON)', () => {
    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: false,
        tutorialId: 'tut-1',
        onMarkCompleteAsync: vi.fn(),
        onAdvanceToNext: vi.fn(),
      }),
    );

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.phase).toBe('idle');
    expect(result.current.countdown).toBe(3);
  });

  it('can be toggled off and on', () => {
    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: false,
        tutorialId: 'tut-1',
        onMarkCompleteAsync: vi.fn(),
        onAdvanceToNext: vi.fn(),
      }),
    );

    act(() => {
      result.current.setIsEnabled(false);
    });
    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.setIsEnabled(true);
    });
    expect(result.current.isEnabled).toBe(true);
  });

  it('awaits markComplete API before starting countdown when current video is unwatched', async () => {
    let resolveApi: (() => void) | undefined;
    const onMarkCompleteAsync = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveApi = resolve;
        }),
    );
    const onAdvanceToNext = vi.fn();

    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: false,
        tutorialId: 'tut-1',
        onMarkCompleteAsync,
        onAdvanceToNext,
      }),
    );

    let endedPromise: Promise<void> | undefined;
    act(() => {
      endedPromise = result.current.handleVideoEnded();
    });

    // In saving phase while API is pending
    expect(result.current.phase).toBe('saving');
    expect(result.current.isSaving).toBe(true);
    expect(onMarkCompleteAsync).toHaveBeenCalledWith({
      id: 'tut-1',
      mediaAssetId: 'v1',
    });

    // Resolve API response
    await act(async () => {
      resolveApi?.();
      await endedPromise;
    });

    // Should now be in counting phase with 3s countdown
    expect(result.current.phase).toBe('counting');
    expect(result.current.isCounting).toBe(true);
    expect(result.current.countdown).toBe(3);

    // Fast-forward 1 second -> countdown is 2
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(2);

    // Fast-forward 1 second -> countdown is 1
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(1);

    // Fast-forward 1 second -> triggers advance
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.phase).toBe('idle');
    expect(onAdvanceToNext).toHaveBeenCalledTimes(1);
    expect(onAdvanceToNext).toHaveBeenCalledWith(mockVideo2);
  });

  it('skips markComplete API if current video is already completed', async () => {
    const onMarkCompleteAsync = vi.fn();
    const onAdvanceToNext = vi.fn();

    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: true,
        tutorialId: 'tut-1',
        onMarkCompleteAsync,
        onAdvanceToNext,
      }),
    );

    await act(async () => {
      await result.current.handleVideoEnded();
    });

    expect(onMarkCompleteAsync).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('counting');
    expect(result.current.countdown).toBe(3);

    // Advance 3s
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onAdvanceToNext).toHaveBeenCalledWith(mockVideo2);
  });

  it('halts autoplay if markComplete API fails', async () => {
    const onMarkCompleteAsync = vi.fn().mockRejectedValue(new Error('Network error'));
    const onAdvanceToNext = vi.fn();

    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: false,
        tutorialId: 'tut-1',
        onMarkCompleteAsync,
        onAdvanceToNext,
      }),
    );

    await act(async () => {
      await result.current.handleVideoEnded();
    });

    // Should return to idle without starting countdown or advancing
    expect(result.current.phase).toBe('idle');
    expect(result.current.isCounting).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onAdvanceToNext).not.toHaveBeenCalled();
  });

  it('playNow skips countdown and immediately advances to next video', async () => {
    const onAdvanceToNext = vi.fn();

    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: true,
        tutorialId: 'tut-1',
        onMarkCompleteAsync: vi.fn(),
        onAdvanceToNext,
      }),
    );

    await act(async () => {
      await result.current.handleVideoEnded();
    });

    expect(result.current.isCounting).toBe(true);

    act(() => {
      result.current.playNow();
    });

    expect(result.current.phase).toBe('idle');
    expect(onAdvanceToNext).toHaveBeenCalledTimes(1);
    expect(onAdvanceToNext).toHaveBeenCalledWith(mockVideo2);
  });

  it('cancelAutoplay cancels countdown and does not advance', async () => {
    const onAdvanceToNext = vi.fn();

    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo1,
        nextVideo: mockVideo2,
        isCurrentVideoCompleted: true,
        tutorialId: 'tut-1',
        onMarkCompleteAsync: vi.fn(),
        onAdvanceToNext,
      }),
    );

    await act(async () => {
      await result.current.handleVideoEnded();
    });

    expect(result.current.isCounting).toBe(true);

    act(() => {
      result.current.cancelAutoplay();
    });

    expect(result.current.phase).toBe('idle');
    expect(result.current.isCounting).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onAdvanceToNext).not.toHaveBeenCalled();
  });

  it('does nothing when nextVideo is null (last video)', async () => {
    const onMarkCompleteAsync = vi.fn();
    const onAdvanceToNext = vi.fn();

    const { result } = renderHook(() =>
      useTutorialAutoplay({
        currentVideo: mockVideo2,
        nextVideo: null,
        isCurrentVideoCompleted: false,
        tutorialId: 'tut-1',
        onMarkCompleteAsync,
        onAdvanceToNext,
      }),
    );

    await act(async () => {
      await result.current.handleVideoEnded();
    });

    expect(result.current.phase).toBe('idle');
    expect(onMarkCompleteAsync).not.toHaveBeenCalled();
    expect(onAdvanceToNext).not.toHaveBeenCalled();
  });
});
