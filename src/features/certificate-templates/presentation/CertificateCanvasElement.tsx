import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react';
import { cn } from '@shared/utils';
import type { Point } from './certificate-canvas-geometry';
import { useCertificateCanvasDrag } from './use-certificate-canvas-drag';
import styles from './CertificateEditorCanvas.module.css';

const SELECT_KEYS = new Set(['Enter', ' ']);

export interface CertificateCanvasElementProps {
  readonly canvasRef: RefObject<HTMLDivElement>;
  readonly style: CSSProperties;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly onMove: (percent: Point) => void;
  readonly onResize?: (percent: Point) => void;
  /** Present only for elements with editable content — double-click enters in-place text editing. */
  readonly onDoubleClick?: (() => void) | undefined;
  readonly children: ReactNode;
}

/**
 * A selectable, draggable overlay element on the certificate editor canvas — shared by every
 * text/QR handle so drag/resize/selection behave identically. A single click selects (and starts
 * a drag); a double-click, where supported, hands off to in-place text editing instead.
 */
export const CertificateCanvasElement = ({
  canvasRef,
  style,
  selected,
  onSelect,
  onMove,
  onResize,
  onDoubleClick,
  children,
}: CertificateCanvasElementProps): ReactElement => {
  const startMove = useCertificateCanvasDrag(canvasRef, onMove);
  const startResize = useCertificateCanvasDrag(canvasRef, onResize ?? (() => undefined));

  return (
    <div
      className={cn(styles.element, selected && styles.selected)}
      style={style}
      role="button"
      tabIndex={0}
      onPointerDown={(event) => {
        onSelect();
        startMove(event);
      }}
      onDoubleClick={onDoubleClick}
      onKeyDown={(event) => {
        if (SELECT_KEYS.has(event.key)) {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      {children}
      {selected && onResize !== undefined ? (
        <span
          className={styles.resizeHandle}
          onPointerDown={startResize}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
};
