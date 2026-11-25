import { useLayoutEffect, useRef, type CSSProperties, type ReactElement } from 'react';
import { NAME_MIN_FONT_SIZE } from './certificate-fit-name-script';

export interface FitNameTextProps {
  readonly text: string;
  /** The designed font size (px) — the name shrinks from here only when it would not fit. */
  readonly maxSize: number;
  readonly className?: string | undefined;
  readonly style?: CSSProperties | undefined;
}

const shrinkToFit = (element: HTMLElement, maxSize: number): void => {
  let size = maxSize;
  element.style.setProperty('font-size', `${String(size)}px`);
  while (element.scrollWidth > element.clientWidth && size > NAME_MIN_FONT_SIZE) {
    size -= 1;
    element.style.setProperty('font-size', `${String(size)}px`);
  }
};

/**
 * The recipient name on a single line, shrunk to fit its element's width — mirrors the script in
 * the exported HTML template (`FIT_NAME_SCRIPT`) so the editor canvas and preview show what the
 * backend-rendered PNG will. Re-fits once web fonts finish loading, since glyph widths change.
 */
export const FitNameText = ({
  text,
  maxSize,
  className,
  style,
}: FitNameTextProps): ReactElement => {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    shrinkToFit(element, maxSize);
    let cancelled = false;
    // `document.fonts` is missing in some environments (e.g. jsdom) — the first fit still ran.
    if (!('fonts' in document)) {
      return undefined;
    }
    void document.fonts.ready.then(() => {
      if (!cancelled) {
        shrinkToFit(element, maxSize);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [text, maxSize]);

  return (
    <p ref={ref} className={className} style={{ ...style, whiteSpace: 'nowrap' }}>
      {text}
    </p>
  );
};
