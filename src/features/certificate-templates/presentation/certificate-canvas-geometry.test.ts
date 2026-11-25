import { describe, expect, it } from 'vitest';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_QR_SIZE,
  MIN_QR_SIZE,
  clampPercent,
  pointerToPercent,
  pxToPercentWidth,
  resizeQrSize,
  resizeTextWidth,
} from './certificate-canvas-geometry';

const rect = {
  left: 100,
  top: 50,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
} as DOMRect;

describe('clampPercent', () => {
  it('leaves in-range values untouched', () => {
    expect(clampPercent(42.5)).toBe(42.5);
  });

  it('clamps below zero to zero', () => {
    expect(clampPercent(-10)).toBe(0);
  });

  it('clamps above 100 to 100', () => {
    expect(clampPercent(150)).toBe(100);
  });
});

describe('pointerToPercent', () => {
  it('maps the canvas top-left corner to 0%,0%', () => {
    expect(pointerToPercent({ x: 100, y: 50 }, rect)).toEqual({ x: 0, y: 0 });
  });

  it('maps the canvas centre to 50%,50%', () => {
    const point = { x: 100 + CANVAS_WIDTH / 2, y: 50 + CANVAS_HEIGHT / 2 };
    expect(pointerToPercent(point, rect)).toEqual({ x: 50, y: 50 });
  });

  it('clamps pointer positions outside the canvas bounds', () => {
    expect(pointerToPercent({ x: -1000, y: 10000 }, rect)).toEqual({ x: 0, y: 100 });
  });
});

describe('pxToPercentWidth', () => {
  it('converts a base-canvas-width px length into a percentage', () => {
    expect(pxToPercentWidth(CANVAS_WIDTH / 4)).toBe(25);
  });

  it('clamps to 100 when the length exceeds the canvas width', () => {
    expect(pxToPercentWidth(CANVAS_WIDTH * 2)).toBe(100);
  });
});

describe('resizeTextWidth', () => {
  it('doubles the distance from the anchor to the pointer', () => {
    expect(resizeTextWidth({ x: 50, y: 50 }, { x: 60, y: 50 })).toBe(20);
  });

  it('never goes below the minimum width', () => {
    expect(resizeTextWidth({ x: 50, y: 50 }, { x: 50.5, y: 50 })).toBe(15);
  });

  it('clamps to 100 when the pointer is dragged past the canvas edge', () => {
    expect(resizeTextWidth({ x: 10, y: 50 }, { x: 90, y: 50 })).toBe(100);
  });
});

describe('resizeQrSize', () => {
  it('grows with the larger of the horizontal/vertical distance from the anchor', () => {
    // deltaPercent = max(|55-50|, |60-50|) = 10 → size = (10/100) * 2 * CANVAS_WIDTH
    const size = resizeQrSize({ x: 50, y: 50 }, { x: 55, y: 60 });
    expect(size).toBeCloseTo((10 / 100) * 2 * CANVAS_WIDTH, 5);
  });

  it('never goes below the minimum size', () => {
    expect(resizeQrSize({ x: 50, y: 50 }, { x: 50.1, y: 50 })).toBe(MIN_QR_SIZE);
  });

  it('never exceeds the maximum size', () => {
    expect(resizeQrSize({ x: 10, y: 10 }, { x: 90, y: 90 })).toBe(MAX_QR_SIZE);
  });
});
