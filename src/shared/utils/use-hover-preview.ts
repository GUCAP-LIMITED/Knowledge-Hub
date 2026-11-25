import { useEffect, useRef, useState, type RefObject } from 'react';

const SHOW_DELAY_MS = 300;
const HIDE_DELAY_MS = 200;
const PREVIEW_WIDTH_PX = 320;

export type PreviewSide = 'left' | 'right';

export interface HoverPreview {
  readonly ref: RefObject<HTMLDivElement>;
  readonly side: PreviewSide | null;
  readonly onMouseEnter: () => void;
  readonly onMouseLeave: () => void;
}

/**
 * Delays a hover preview so it only appears on deliberate hover, picks a side that fits the
 * viewport, and delays hiding so crossing the small gap to reach the preview doesn't close it.
 */
export const useHoverPreview = (): HoverPreview => {
  const ref = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [side, setSide] = useState<PreviewSide | null>(null);

  useEffect(
    () => () => {
      if (showTimer.current) {
        clearTimeout(showTimer.current);
      }
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    },
    [],
  );

  const onMouseEnter = (): void => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (side !== null || showTimer.current) {
      return;
    }
    showTimer.current = setTimeout(() => {
      const rect = ref.current?.getBoundingClientRect();
      const overflowsRight = rect
        ? rect.right + PREVIEW_WIDTH_PX > window.innerWidth
        : false;
      setSide(overflowsRight ? 'left' : 'right');
      showTimer.current = null;
    }, SHOW_DELAY_MS);
  };

  const onMouseLeave = (): void => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    hideTimer.current = setTimeout(() => {
      setSide(null);
      hideTimer.current = null;
    }, HIDE_DELAY_MS);
  };

  return { ref, side, onMouseEnter, onMouseLeave };
};
