import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Keep tests isolated: unmount React trees and reset jsdom between cases.
afterEach(() => {
  cleanup();
});

// jsdom's Element type declares these but doesn't implement them at runtime — Radix's
// popper-positioned popups (Select, Popover, DropdownMenu) call them when opening/scrolling.
// Without a stub, interacting with such a popup throws in tests.
Element.prototype.hasPointerCapture = (): boolean => false;
Element.prototype.setPointerCapture = (): undefined => undefined;
Element.prototype.releasePointerCapture = (): undefined => undefined;
Element.prototype.scrollIntoView = (): undefined => undefined;

class NoopResizeObserver implements ResizeObserver {
  public observe(): undefined {
    return undefined;
  }
  public unobserve(): undefined {
    return undefined;
  }
  public disconnect(): undefined {
    return undefined;
  }
}
globalThis.ResizeObserver = NoopResizeObserver;

class NoopIntersectionObserver implements IntersectionObserver {
  public readonly root: Element | Document | null = null;
  public readonly rootMargin: string = '';
  public readonly thresholds: readonly number[] = [];
  public observe(): undefined {
    return undefined;
  }
  public unobserve(): undefined {
    return undefined;
  }
  public disconnect(): undefined {
    return undefined;
  }
  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver = NoopIntersectionObserver;

// jsdom has no native PointerEvent — `clientX`/`clientY` (inherited from MouseEvent) are the only
// bits any component here reads off a pointer event, so a thin MouseEvent subclass is enough to
// let hand-rolled drag interactions (and `fireEvent.pointer*`) carry real coordinates in tests.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    public readonly pointerId: number;
    public readonly pointerType: string;

    public constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? 'mouse';
    }
  }
  globalThis.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

// `@floating-ui/dom` (used by every Radix popper-positioned popup) probes `:popover-open` and
// `:modal` on each ancestor while positioning. jsdom's selector engine (nwsapi) has no fast path for
// either pseudo-class and falls back to a pathologically slow resolution — a single dropdown open
// can take 15-20s and blow past test timeouts. Neither can ever be true in jsdom (no real top-layer),
// so short-circuiting them to `false` is both correct and removes the slow path entirely.
const originalMatches = Element.prototype.matches;
Element.prototype.matches = function matches(selector: string): boolean {
  if (selector === ':popover-open' || selector === ':modal') {
    return false;
  }
  return originalMatches.call(this, selector);
};
