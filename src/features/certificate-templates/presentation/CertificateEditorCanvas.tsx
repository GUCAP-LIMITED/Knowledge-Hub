import {
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type RefObject,
} from 'react';
import { QrCode } from 'lucide-react';
import { cn } from '@shared/utils';
import type {
  CertificateDesign,
  CertificateKind,
  CertificateStaticElementId,
  CertificateTextElementId,
  CertificateTextElementStyle,
} from '../store/certificate-template-store';
import {
  isCertificateStaticElement,
  useCertificateTemplateStore,
} from '../store/certificate-template-store';
import {
  resolveBodyText,
  SAMPLE_ARTWORK_DATA,
  type CertificateArtworkData,
} from './certificate-artwork-data';
import { resizeQrSize, resizeTextWidth, type Point } from './certificate-canvas-geometry';
import { CertificateCanvasElement } from './CertificateCanvasElement';
import { qrElementStyle, textElementStyle } from './certificate-element-style';
import { EditableText } from './EditableText';
import { FitNameText } from './FitNameText';
import styles from './CertificateEditorCanvas.module.css';

export type CertificateSelectedElement = CertificateTextElementId | 'qrcode';

export interface CertificateEditorCanvasProps {
  readonly kind: CertificateKind;
  readonly design: CertificateDesign;
  /** `null` means nothing is selected — no element shows the selection outline. */
  readonly selected: CertificateSelectedElement | null;
  readonly onSelect: (element: CertificateSelectedElement) => void;
}

interface TextElementDescriptor {
  readonly id: CertificateTextElementId;
  readonly style: CertificateTextElementStyle;
  readonly content: string;
}

const textElements = (
  design: CertificateDesign,
  sample: CertificateArtworkData,
): readonly TextElementDescriptor[] => [
  {
    id: 'heading',
    style: design.headingStyle,
    content: resolveBodyText(design.heading, sample),
  },
  {
    id: 'kicker',
    style: design.kickerStyle,
    content: resolveBodyText(design.kicker, sample),
  },
  { id: 'name', style: design.nameStyle, content: sample.userName },
  {
    id: 'bodyText',
    style: design.bodyTextStyle,
    content: resolveBodyText(design.bodyText, sample),
  },
];

interface TextElementContentProps {
  readonly kind: CertificateKind;
  readonly design: CertificateDesign;
  readonly element: TextElementDescriptor;
  readonly isEditing: boolean;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
}

/** The element's rendered text — a live preview normally, or a `contentEditable` node bound to
 * the *raw* stored copy (not the sample-data-resolved preview) while it's being edited, so a
 * `{{courseName}}` token round-trips instead of being baked in as sample data. */
const TextElementContent = ({
  kind,
  design,
  element,
  isEditing,
  onCommit,
  onCancel,
}: TextElementContentProps): ReactElement => {
  if (isEditing && isCertificateStaticElement(element.id)) {
    return (
      <EditableText
        key={`${kind}-${element.id}`}
        initialValue={design[element.id]}
        multiline={element.id !== 'kicker'}
        className={cn(styles.text, styles.textEditing)}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );
  }
  if (element.id === 'name') {
    return (
      <FitNameText
        className={styles.text}
        text={element.content}
        maxSize={element.style.fontSize}
      />
    );
  }
  return <p className={styles.text}>{element.content}</p>;
};

interface TextElementSlotProps {
  readonly kind: CertificateKind;
  readonly design: CertificateDesign;
  readonly element: TextElementDescriptor;
  readonly canvasRef: RefObject<HTMLDivElement>;
  readonly selected: boolean;
  readonly editing: boolean;
  readonly onSelect: () => void;
  readonly onStartEditing: () => void;
  readonly onMove: (percent: Point) => void;
  readonly onResize: (percent: Point) => void;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
}

/** One draggable/resizable/selectable canvas element, wired to in-place editing when its content
 * is admin-authored. Split out so `CertificateEditorCanvas` stays within the function-size limit. */
const TextElementSlot = ({
  kind,
  design,
  element,
  canvasRef,
  selected,
  editing,
  onSelect,
  onStartEditing,
  onMove,
  onResize,
  onCommit,
  onCancel,
}: TextElementSlotProps): ReactElement => (
  <CertificateCanvasElement
    canvasRef={canvasRef}
    style={textElementStyle(element.style)}
    selected={selected}
    onSelect={onSelect}
    onMove={onMove}
    onResize={onResize}
    onDoubleClick={isCertificateStaticElement(element.id) ? onStartEditing : undefined}
  >
    <TextElementContent
      kind={kind}
      design={design}
      element={element}
      isEditing={editing}
      onCommit={onCommit}
      onCancel={onCancel}
    />
  </CertificateCanvasElement>
);

interface CanvasDragHandlers {
  readonly moveText: (element: CertificateTextElementId) => (percent: Point) => void;
  readonly resizeText: (
    element: CertificateTextElementId,
    anchor: Point,
  ) => (percent: Point) => void;
  readonly moveQr: (percent: Point) => void;
  readonly resizeQr: (anchor: Point) => (percent: Point) => void;
}

/** The drag/resize commit handlers for one kind's canvas — split out of the component so it stays
 * within the function-size limit. */
const useCanvasDragHandlers = (kind: CertificateKind): CanvasDragHandlers => {
  const updateTextStyle = useCertificateTemplateStore((state) => state.updateTextStyle);
  const updateQrStyle = useCertificateTemplateStore((state) => state.updateQrStyle);

  return {
    moveText: (element) => (percent) => {
      updateTextStyle(kind, element, { x: percent.x, y: percent.y });
    },
    resizeText: (element, anchor) => (percent) => {
      updateTextStyle(kind, element, { width: resizeTextWidth(anchor, percent) });
    },
    moveQr: (percent) => {
      updateQrStyle(kind, { x: percent.x, y: percent.y });
    },
    resizeQr: (anchor) => (percent) => {
      updateQrStyle(kind, { size: resizeQrSize(anchor, percent) });
    },
  };
};

interface CanvasEditingHandlers {
  readonly editingElement: CertificateStaticElementId | null;
  readonly startEditing: (element: CertificateTextElementId) => void;
  readonly commitEditing: (element: CertificateTextElementId, value: string) => void;
  readonly cancelEditing: () => void;
}

/** In-place text-editing state for one kind's canvas — which element (if any) is currently being
 * typed into directly, and how entering/committing/cancelling that updates the store. */
const useCanvasEditing = (
  kind: CertificateKind,
  onSelect: (element: CertificateSelectedElement) => void,
): CanvasEditingHandlers => {
  const updateElementContent = useCertificateTemplateStore(
    (state) => state.updateElementContent,
  );
  const [editingElement, setEditingElement] = useState<CertificateStaticElementId | null>(
    null,
  );

  return {
    editingElement,
    startEditing: (element) => {
      if (isCertificateStaticElement(element)) {
        onSelect(element);
        setEditingElement(element);
      }
    },
    commitEditing: (element, value) => {
      if (isCertificateStaticElement(element)) {
        updateElementContent(kind, element, value);
      }
      setEditingElement(null);
    },
    cancelEditing: () => {
      setEditingElement(null);
    },
  };
};

/**
 * Interactive, drag-and-drop version of `CertificateArtwork`, used only in the admin editor: the
 * heading, kicker, body copy, name, and QR elements can be selected, dragged to reposition, and
 * resized — heading/kicker/body copy can also be double-clicked to type directly on the canvas.
 * Position math lives in `certificate-canvas-geometry.ts` so this component stays declarative.
 */
export const CertificateEditorCanvas = ({
  kind,
  design,
  selected,
  onSelect,
}: CertificateEditorCanvasProps): ReactElement => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { moveText, resizeText, moveQr, resizeQr } = useCanvasDragHandlers(kind);
  const { editingElement, startEditing, commitEditing, cancelEditing } = useCanvasEditing(
    kind,
    onSelect,
  );
  const sample = SAMPLE_ARTWORK_DATA[kind];

  const canvasStyle: CSSProperties =
    design.backgroundImage !== undefined
      ? { backgroundImage: `url(${design.backgroundImage})` }
      : {};

  return (
    <div ref={canvasRef} className={styles.canvas} style={canvasStyle}>
      {textElements(design, sample).map((element) => (
        <TextElementSlot
          key={element.id}
          kind={kind}
          design={design}
          element={element}
          canvasRef={canvasRef}
          selected={selected === element.id}
          editing={editingElement === element.id}
          onSelect={() => {
            onSelect(element.id);
          }}
          onStartEditing={() => {
            startEditing(element.id);
          }}
          onMove={moveText(element.id)}
          onResize={resizeText(element.id, { x: element.style.x, y: element.style.y })}
          onCommit={(value) => {
            commitEditing(element.id, value);
          }}
          onCancel={cancelEditing}
        />
      ))}

      <CertificateCanvasElement
        canvasRef={canvasRef}
        style={qrElementStyle(design.qrStyle)}
        selected={selected === 'qrcode'}
        onSelect={() => {
          onSelect('qrcode');
        }}
        onMove={moveQr}
        onResize={resizeQr({ x: design.qrStyle.x, y: design.qrStyle.y })}
      >
        <QrCode className={styles.qr} aria-hidden="true" />
      </CertificateCanvasElement>
    </div>
  );
};
