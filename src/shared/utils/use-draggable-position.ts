import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';

export interface DraggablePosition {
  readonly x: number;
  readonly y: number;
}

export interface UseDraggablePositionResult {
  /** Null until the first drag — meaning "use the element's default CSS position". */
  readonly position: DraggablePosition | null;
  readonly isDragging: boolean;
  readonly onHandleMouseDown: (event: ReactMouseEvent) => void;
  /** True if the most recent mousedown moved past the drag threshold — lets a handle that's also
      clickable (e.g. a minimized bubble) tell a drag from a plain click, checked from `onClick`. */
  readonly wasDragged: () => boolean;
}

interface DragOrigin {
  readonly pointerX: number;
  readonly pointerY: number;
  readonly originX: number;
  readonly originY: number;
}

/** Pointer movement below this (px) since mousedown still counts as a click, not a drag. */
const DRAG_THRESHOLD_PX = 4;

/**
 * Lets a fixed-position element (referenced by `containerRef`) be repositioned by dragging a
 * handle. Wire `onHandleMouseDown` to the handle's `onMouseDown`, and apply `position` as inline
 * `left`/`top` (clearing `right`/`bottom`) once it's non-null.
 */
export const useDraggablePosition = (
  containerRef: RefObject<HTMLElement | null>,
): UseDraggablePositionResult => {
  const [position, setPosition] = useState<DraggablePosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<DragOrigin | null>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent): void => {
      const origin = dragOrigin.current;
      if (origin === null) return;
      const dx = event.clientX - origin.pointerX;
      const dy = event.clientY - origin.pointerY;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
        hasMoved.current = true;
      }
      setPosition({ x: origin.originX + dx, y: origin.originY + dy });
    };
    const onMouseUp = (): void => {
      dragOrigin.current = null;
      setIsDragging(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onHandleMouseDown = useCallback(
    (event: ReactMouseEvent): void => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect === undefined) return;
      dragOrigin.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        originX: rect.left,
        originY: rect.top,
      };
      hasMoved.current = false;
      setIsDragging(true);
    },
    [containerRef],
  );

  const wasDragged = useCallback((): boolean => hasMoved.current, []);

  return { position, isDragging, onHandleMouseDown, wasDragged };
};
