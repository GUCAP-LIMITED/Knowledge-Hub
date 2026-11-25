import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { pointerToPercent, type Point } from './certificate-canvas-geometry';

export type CertificateCanvasDragHandler = (event: ReactPointerEvent) => void;

/**
 * Starts a window-level pointer drag anchored to the canvas: reports live canvas-relative percent
 * positions to `onMove` until pointerup. Used for both repositioning an element and resizing it —
 * the caller decides what a percent position means (see `certificate-canvas-geometry.ts`'s
 * `resizeTextWidth`/`resizeQrSize`).
 */
export const useCertificateCanvasDrag = (
  canvasRef: RefObject<HTMLDivElement>,
  onMove: (percent: Point) => void,
): CertificateCanvasDragHandler =>
  useCallback(
    (event: ReactPointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const canvas = canvasRef.current;
      if (canvas === null) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const handleMove = (moveEvent: PointerEvent): void => {
        onMove(pointerToPercent({ x: moveEvent.clientX, y: moveEvent.clientY }, rect));
      };
      const handleUp = (): void => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [canvasRef, onMove],
  );
