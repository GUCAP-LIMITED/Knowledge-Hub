import { useEffect, type RefObject } from 'react';

/** Radix popper-positioned popups (Select, DropdownMenu, Popover, Tooltip) render their content
 * in a portal attached to `document.body` — outside the trigger's own DOM subtree entirely. A
 * click on, say, a Select option is technically "outside" the editor ref, so without this
 * exclusion, picking a font weight would deselect the element (and lose the click) before the
 * option's own `onChange` could fire. */
const isInsideRadixPopper = (target: Node): boolean =>
  target instanceof Element &&
  target.closest('[data-radix-popper-content-wrapper]') !== null;

/** Calls `onOutsideClick` for any pointerdown whose target falls outside `ref`'s DOM subtree (and
 * outside any open Radix popper popup) — e.g. deselecting a canvas element when the admin clicks
 * elsewhere on the page, the way Canva does. Only listens while `enabled` is true, so there's
 * nothing to tear down when there's nothing to deselect. */
export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled: boolean,
): void => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const handlePointerDown = (event: PointerEvent): void => {
      const node = ref.current;
      if (node === null || !(event.target instanceof Node)) {
        return;
      }
      if (!node.contains(event.target) && !isInsideRadixPopper(event.target)) {
        onOutsideClick();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [ref, onOutsideClick, enabled]);
};
