import { useEffect, useRef, useState, type RefObject } from 'react';

export interface UseFullscreenResult<T extends HTMLElement> {
  readonly ref: RefObject<T>;
  readonly isFullscreen: boolean;
  readonly toggleFullscreen: () => void;
}

/** Tracks and toggles the native Fullscreen API for the element attached to the returned ref. */
export const useFullscreen = <T extends HTMLElement>(): UseFullscreenResult<T> => {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = (): void => {
    const element = ref.current;
    if (!element) return;
    if (!document.fullscreenElement) {
      void element.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  return { ref, isFullscreen, toggleFullscreen };
};
