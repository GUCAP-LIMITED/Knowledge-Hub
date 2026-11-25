import { useState, useRef, useEffect, useCallback } from 'react';
import type { TutorialVideo } from '../domain';

export type AutoplayPhase = 'idle' | 'saving' | 'counting' | 'cancelled';

export interface UseTutorialAutoplayOptions {
  readonly currentVideo: TutorialVideo | null;
  readonly nextVideo: TutorialVideo | null;
  readonly isCurrentVideoCompleted: boolean;
  readonly tutorialId: string;
  readonly onMarkCompleteAsync: (input: {
    readonly id: string;
    readonly mediaAssetId: string;
  }) => Promise<unknown>;
  readonly onAdvanceToNext: (nextVideo: TutorialVideo) => void;
  readonly delaySeconds?: number;
}

export interface UseTutorialAutoplayReturn {
  readonly isEnabled: boolean;
  readonly setIsEnabled: (enabled: boolean) => void;
  readonly phase: AutoplayPhase;
  readonly countdown: number;
  readonly isSaving: boolean;
  readonly isCounting: boolean;
  readonly handleVideoEnded: () => Promise<void>;
  readonly cancelAutoplay: () => void;
  readonly playNow: () => void;
}

const DEFAULT_DELAY_SECONDS = 3;

interface UseCountdownIntervalReturn {
  readonly countdown: number;
  readonly isCounting: boolean;
  readonly startCountdown: () => void;
  readonly stopCountdown: () => void;
}

const useCountdownInterval = (
  delaySeconds: number,
  onFinish: () => void,
): UseCountdownIntervalReturn => {
  const [countdown, setCountdown] = useState<number>(delaySeconds);
  const [isCounting, setIsCounting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCountdown = useCallback((): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCounting(false);
    setCountdown(delaySeconds);
  }, [delaySeconds]);

  const startCountdown = useCallback((): void => {
    stopCountdown();
    setIsCounting(true);
    setCountdown(delaySeconds);

    let remaining = delaySeconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stopCountdown();
        onFinish();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [delaySeconds, onFinish, stopCountdown]);

  useEffect(() => stopCountdown, [stopCountdown]);

  return { countdown, isCounting, startCountdown, stopCountdown };
};

export const useTutorialAutoplay = ({
  currentVideo,
  nextVideo,
  isCurrentVideoCompleted,
  tutorialId,
  onMarkCompleteAsync,
  onAdvanceToNext,
  delaySeconds = DEFAULT_DELAY_SECONDS,
}: UseTutorialAutoplayOptions): UseTutorialAutoplayReturn => {
  const [isEnabled, setIsEnabledState] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const nextVideoRef = useRef(nextVideo);
  nextVideoRef.current = nextVideo;

  const handleFinish = useCallback((): void => {
    if (nextVideoRef.current) onAdvanceToNext(nextVideoRef.current);
  }, [onAdvanceToNext]);

  const { countdown, isCounting, startCountdown, stopCountdown } = useCountdownInterval(
    delaySeconds,
    handleFinish,
  );

  const cancelAutoplay = useCallback((): void => {
    setIsSaving(false);
    stopCountdown();
  }, [stopCountdown]);

  const setIsEnabled = useCallback(
    (enabled: boolean): void => {
      setIsEnabledState(enabled);
      if (!enabled) cancelAutoplay();
    },
    [cancelAutoplay],
  );

  const playNow = useCallback((): void => {
    cancelAutoplay();
    handleFinish();
  }, [cancelAutoplay, handleFinish]);

  const currentVideoId = currentVideo?.id;
  useEffect(() => {
    cancelAutoplay();
  }, [currentVideoId, cancelAutoplay]);

  const handleVideoEnded = useCallback(async (): Promise<void> => {
    if (!isEnabled || !nextVideoRef.current || !currentVideo) return;
    if (!isCurrentVideoCompleted) {
      setIsSaving(true);
      try {
        await onMarkCompleteAsync({ id: tutorialId, mediaAssetId: currentVideo.id });
      } catch {
        cancelAutoplay();
        return;
      }
    }
    setIsSaving(false);
    startCountdown();
  }, [
    isEnabled,
    currentVideo,
    isCurrentVideoCompleted,
    onMarkCompleteAsync,
    tutorialId,
    cancelAutoplay,
    startCountdown,
  ]);

  return {
    isEnabled,
    setIsEnabled,
    phase: isSaving ? 'saving' : isCounting ? 'counting' : 'idle',
    countdown,
    isSaving,
    isCounting,
    handleVideoEnded,
    cancelAutoplay,
    playNow,
  };
};
