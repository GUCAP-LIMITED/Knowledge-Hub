import type { ReactElement } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  SeparatorHorizontal,
  Underline,
  type LucideIcon,
} from 'lucide-react';
import { IconButton, Select } from '@shared/ui';
import { cn } from '@shared/utils';
import {
  isCertificateStaticElement,
  useCertificateTemplateStore,
  type CertificateDesign,
  type CertificateFontWeight,
  type CertificateKind,
  type CertificateTextAlign,
  type CertificateTextElementId,
  type CertificateTextElementStyle,
} from '../store/certificate-template-store';
import type { CertificateSelectedElement } from './CertificateEditorCanvas';
import styles from './CertificateTemplatesManager.module.css';

export interface CertificateElementStylePanelProps {
  readonly kind: CertificateKind;
  readonly design: CertificateDesign;
  readonly selected: CertificateSelectedElement;
}

const FONT_FAMILY_OPTIONS = [
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Lexend Deca', label: 'Lexend Deca' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Alex Brush', label: 'Alex Brush (script)' },
  { value: 'Georgia', label: 'Georgia' },
] as const;

const FONT_WEIGHT_OPTIONS = [
  { value: '400', label: 'Regular' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extrabold' },
] as const;

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 120;
const FONT_SIZE_STEP = 1;

interface AlignOption {
  readonly value: CertificateTextAlign;
  readonly Icon: LucideIcon;
}

const ALIGN_OPTIONS: readonly AlignOption[] = [
  { value: 'left', Icon: AlignLeft },
  { value: 'center', Icon: AlignCenter },
  { value: 'right', Icon: AlignRight },
];

const ELEMENT_LABELS: Record<CertificateTextElementId, string> = {
  heading: 'Heading',
  kicker: 'Kicker line',
  bodyText: 'Body copy',
  name: 'Recipient name',
};

const STYLE_BY_ELEMENT: Record<
  CertificateTextElementId,
  (design: CertificateDesign) => CertificateTextElementStyle
> = {
  heading: (design) => design.headingStyle,
  kicker: (design) => design.kickerStyle,
  bodyText: (design) => design.bodyTextStyle,
  name: (design) => design.nameStyle,
};

const clampFontSize = (value: number): number =>
  Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value));

interface FontSizeStepperProps {
  readonly fontSize: number;
  readonly onChange: (fontSize: number) => void;
}

const FontSizeStepper = ({ fontSize, onChange }: FontSizeStepperProps): ReactElement => (
  <div className={styles.sizeStepper}>
    <IconButton
      label="Decrease font size"
      onClick={() => {
        onChange(clampFontSize(fontSize - FONT_SIZE_STEP));
      }}
    >
      <Minus size={14} aria-hidden="true" />
    </IconButton>
    <input
      className={styles.sizeInput}
      type="number"
      aria-label="Font size (px)"
      min={MIN_FONT_SIZE}
      max={MAX_FONT_SIZE}
      value={fontSize}
      onChange={(event) => {
        // Deliberately unclamped: a controlled number input must call onChange on every
        // keystroke (even an empty/zero intermediate value) or React snaps it back to the old
        // prop value, corrupting anything typed next. Only the +/- steppers clamp.
        onChange(Number(event.target.value));
      }}
    />
    <IconButton
      label="Increase font size"
      onClick={() => {
        onChange(clampFontSize(fontSize + FONT_SIZE_STEP));
      }}
    >
      <Plus size={14} aria-hidden="true" />
    </IconButton>
  </div>
);

interface TextStyleControlsProps {
  readonly style: CertificateTextElementStyle;
  readonly onPatch: (value: Partial<CertificateTextElementStyle>) => void;
}

/** The font/size/colour/weight/alignment row — icon/value-only, no visible field captions (the
 * icon and current value already say what each control does), grouped with thin dividers like a
 * Canva-style toolbar. Split out so the panel's main component stays within the file's
 * function-size limit. */
const TextStyleControls = ({ style, onPatch }: TextStyleControlsProps): ReactElement => (
  <>
    <div className={styles.toolbarFontFamily}>
      <Select
        label="Font family"
        hideLabel
        options={[...FONT_FAMILY_OPTIONS]}
        value={style.fontFamily}
        onChange={(value) => {
          onPatch({ fontFamily: value });
        }}
      />
    </div>
    <FontSizeStepper
      fontSize={style.fontSize}
      onChange={(fontSize) => {
        onPatch({ fontSize });
      }}
    />
    <span className={styles.toolbarDivider} aria-hidden="true" />
    <input
      className={styles.colorSwatch}
      type="color"
      aria-label="Text colour"
      value={style.color}
      onChange={(event) => {
        onPatch({ color: event.target.value });
      }}
    />
    <span className={styles.toolbarDivider} aria-hidden="true" />
    <div className={styles.toolbarFontWeight}>
      <Select
        label="Font weight"
        hideLabel
        options={[...FONT_WEIGHT_OPTIONS]}
        value={String(style.fontWeight)}
        onChange={(value) => {
          onPatch({ fontWeight: Number(value) as CertificateFontWeight });
        }}
      />
    </div>
    <IconButton
      label="Underline"
      aria-pressed={style.underline}
      className={cn(style.underline && styles.alignActive)}
      onClick={() => {
        onPatch({ underline: !style.underline });
      }}
    >
      <Underline size={16} aria-hidden="true" />
    </IconButton>
    <IconButton
      label="Horizontal line"
      aria-pressed={style.horizontalLine}
      className={cn(style.horizontalLine && styles.alignActive)}
      onClick={() => {
        onPatch({ horizontalLine: !style.horizontalLine });
      }}
    >
      <SeparatorHorizontal size={16} aria-hidden="true" />
    </IconButton>
    <div className={styles.alignButtons}>
      {ALIGN_OPTIONS.map(({ value, Icon }) => (
        <IconButton
          key={value}
          label={`Align ${value}`}
          className={cn(style.textAlign === value && styles.alignActive)}
          onClick={() => {
            onPatch({ textAlign: value });
          }}
        >
          <Icon size={16} aria-hidden="true" />
        </IconButton>
      ))}
    </div>
  </>
);

const QrToolbar = (): ReactElement => (
  <div className={styles.elementToolbar} role="toolbar" aria-label="QR code">
    <div className={styles.elementToolbarRow}>
      <span className={styles.elementToolbarLabel}>QR code</span>
    </div>
    <p className={styles.hint}>
      Generated by the backend for each certificate — drag it on the canvas to reposition,
      or drag its handle to resize. No style controls apply.
    </p>
  </div>
);

/**
 * Style controls for the currently-selected canvas element — a Canva-style toolbar docked above
 * the canvas. Content itself is edited in place: double-click a heading/kicker/body-copy element
 * directly on the canvas to type into it. The QR element only has position/size, set by dragging.
 */
export const CertificateElementStylePanel = ({
  kind,
  design,
  selected,
}: CertificateElementStylePanelProps): ReactElement => {
  const updateTextStyle = useCertificateTemplateStore((state) => state.updateTextStyle);

  if (selected === 'qrcode') {
    return <QrToolbar />;
  }

  const style = STYLE_BY_ELEMENT[selected](design);
  const patch = (value: Partial<CertificateTextElementStyle>): void => {
    updateTextStyle(kind, selected, value);
  };

  return (
    <div className={styles.elementToolbar} role="toolbar" aria-label="Element style">
      <div className={styles.elementToolbarRow}>
        <span className={styles.elementToolbarLabel}>{ELEMENT_LABELS[selected]}</span>
        <TextStyleControls style={style} onPatch={patch} />
      </div>
      {isCertificateStaticElement(selected) ? (
        <span className={styles.hint}>
          Double-click it on the canvas to edit the text.
        </span>
      ) : null}
    </div>
  );
};
