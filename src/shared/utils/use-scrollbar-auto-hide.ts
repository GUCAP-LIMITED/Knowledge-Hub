import { useEffect } from 'react';

const SCROLLING_CLASS = 'is-scrolling';
const HIDE_DELAY_MS = 1000;

/**
 * Reveals the custom scrollbar (see `.is-scrolling` in global.css) on whichever element is
 * actively being scrolled, then hides it again once scrolling stops. Hover-triggered reveal is
 * handled separately in CSS. Mounted once at the composition root — a capture-phase listener on
 * `document` catches scroll events from every scrollable descendant (sidebar nav, modals, panes).
 */
export function useScrollbarAutoHide(): void {
  useEffect(() => {
    const timeouts = new WeakMap<Element, ReturnType<typeof setTimeout>>();

    const handleScroll = (event: Event): void => {
      const target =
        event.target instanceof Document ? document.documentElement : event.target;
      if (!(target instanceof Element)) {
        return;
      }

      target.classList.add(SCROLLING_CLASS);

      const pending = timeouts.get(target);
      if (pending !== undefined) {
        clearTimeout(pending);
      }

      timeouts.set(
        target,
        setTimeout(() => {
          target.classList.remove(SCROLLING_CLASS);
          timeouts.delete(target);
        }, HIDE_DELAY_MS),
      );
    };

    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);
}
