/** Fixed certificate canvas size (px) at 1x scale — must match `.canvas` in the CSS module and the
 * plain CSS template. `CertificateArtworkScaler` scales the whole block uniformly to fit any
 * container width, so every element keeps this exact aspect ratio at any render size. */
export const CANVAS_WIDTH = 700;
export const CANVAS_HEIGHT = 495;

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Keep a percentage coordinate/size inside the canvas bounds. */
export const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

/** Convert a pointer's viewport position into a canvas-relative percentage, clamped to bounds. */
export const pointerToPercent = (point: Point, canvasRect: DOMRect): Point => ({
  x: clampPercent(((point.x - canvasRect.left) / canvasRect.width) * 100),
  y: clampPercent(((point.y - canvasRect.top) / canvasRect.height) * 100),
});

/** Convert a px length (measured at the base canvas width) into a canvas-relative percentage. */
export const pxToPercentWidth = (px: number): number =>
  clampPercent((px / CANVAS_WIDTH) * 100);

const MIN_TEXT_WIDTH_PERCENT = 15;
export const MIN_QR_SIZE = 24;
export const MAX_QR_SIZE = 260;

/** A text element's wrap-box width while dragging its resize handle: twice the distance from the
 * element's (centred) anchor to the pointer, clamped to a sane minimum. */
export const resizeTextWidth = (anchor: Point, pointer: Point): number =>
  Math.max(MIN_TEXT_WIDTH_PERCENT, clampPercent(2 * Math.abs(pointer.x - anchor.x)));

/** The QR element's square size (px) while dragging its corner resize handle: twice the larger of
 * the pointer's horizontal/vertical distance from the element's centre, converted back to px at
 * the base canvas width. */
export const resizeQrSize = (anchor: Point, pointer: Point): number => {
  const deltaPercent = Math.max(
    Math.abs(pointer.x - anchor.x),
    Math.abs(pointer.y - anchor.y),
  );
  const size = (deltaPercent / 100) * 2 * CANVAS_WIDTH;
  return Math.min(MAX_QR_SIZE, Math.max(MIN_QR_SIZE, size));
};
