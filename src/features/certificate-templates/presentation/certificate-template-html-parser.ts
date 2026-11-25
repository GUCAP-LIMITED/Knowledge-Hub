import type {
  CertificateDesign,
  CertificateFontWeight,
  CertificateQrElementStyle,
  CertificateTextAlign,
  CertificateTextElementStyle,
} from '../store/certificate-template-store';
import {
  CUSTOM_BACKGROUND_ATTR_NAME,
  CUSTOM_BACKGROUND_ATTR_VALUE,
} from './certificate-template-html-utils';

export type CertificateTemplateHtmlFormat = 'new' | 'legacy' | 'unknown';

export interface ParsedCertificateTemplate {
  /** `new` — built by this editor, fully round-trippable. `legacy` — a pre-redesign template;
   * only the admin-authored copy is recovered, never a background or per-element
   * positions/fonts. `unknown` — neither shape matched; nothing was recovered. */
  readonly format: CertificateTemplateHtmlFormat;
  readonly design: Partial<Omit<CertificateDesign, 'kind'>>;
}

/** A mutable builder for the (otherwise `readonly`) design patch while parsing. */
type DesignPatch = {
  -readonly [K in keyof Omit<CertificateDesign, 'kind'>]?: CertificateDesign[K];
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const RGB_COLOR = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i;
const URL_VALUE = /^url\((["']?)(.*)\1\)$/;
const FONT_WEIGHTS: readonly CertificateFontWeight[] = [400, 600, 700, 800];
const TEXT_ALIGNS: readonly CertificateTextAlign[] = ['left', 'center', 'right'];

const toHex = (component: string | undefined): string =>
  Number(component ?? 0)
    .toString(16)
    .padStart(2, '0');

/** CSSOM serialises a set `color` as `rgb(r, g, b)`; the design's colour input needs `#rrggbb`. */
const toHexColor = (value: string, fallback: string): string => {
  if (HEX_COLOR.test(value)) {
    return value.toLowerCase();
  }
  const match = RGB_COLOR.exec(value);
  if (match === null) {
    return fallback;
  }
  const [, r, g, b] = match;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const firstFontFamily = (value: string, fallback: string): string => {
  const first = value
    .split(',')[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, '');
  return first !== undefined && first.length > 0 ? first : fallback;
};

const toFontWeight = (
  value: string,
  fallback: CertificateFontWeight,
): CertificateFontWeight => {
  const parsed = Number.parseInt(value, 10);
  return (FONT_WEIGHTS as readonly number[]).includes(parsed)
    ? (parsed as CertificateFontWeight)
    : fallback;
};

const toTextAlign = (
  value: string,
  fallback: CertificateTextAlign,
): CertificateTextAlign =>
  (TEXT_ALIGNS as readonly string[]).includes(value)
    ? (value as CertificateTextAlign)
    : fallback;

const toPercent = (value: string, fallback: number): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** `text-decoration-line`/`border-bottom-style` may come back empty (never set) rather than the
 * CSS-default `none` — that's not itself a signal either way, so an empty value falls back like
 * any other unset style. */
const toUnderline = (value: string, fallback: boolean): boolean =>
  value.length === 0 ? fallback : value.includes('underline');

const toHorizontalLine = (value: string, fallback: boolean): boolean =>
  value.length === 0 ? fallback : value !== 'none';

const readTextStyle = (
  element: Element,
  fallback: CertificateTextElementStyle,
): CertificateTextElementStyle => {
  const style = (element as HTMLElement).style;
  return {
    x: toPercent(style.left, fallback.x),
    y: toPercent(style.top, fallback.y),
    width: toPercent(style.width, fallback.width),
    fontFamily: firstFontFamily(style.fontFamily, fallback.fontFamily),
    fontSize: toPercent(style.fontSize, fallback.fontSize),
    color: toHexColor(style.color, fallback.color),
    fontWeight: toFontWeight(style.fontWeight, fallback.fontWeight),
    textAlign: toTextAlign(style.textAlign, fallback.textAlign),
    underline: toUnderline(style.textDecorationLine, fallback.underline),
    horizontalLine: toHorizontalLine(style.borderBottomStyle, fallback.horizontalLine),
  };
};

const readQrStyle = (
  element: Element,
  fallback: CertificateQrElementStyle,
): CertificateQrElementStyle => {
  const style = (element as HTMLElement).style;
  return {
    x: toPercent(style.left, fallback.x),
    y: toPercent(style.top, fallback.y),
    size: toPercent(style.width, fallback.size),
  };
};

const readBackgroundImage = (canvas: Element): string | undefined => {
  const raw = (canvas as HTMLElement).style.backgroundImage;
  if (raw.length === 0) {
    return undefined;
  }
  const match = URL_VALUE.exec(raw);
  return match?.[2];
};

/** `Element.textContent` is non-null (only `Document`/`DocumentType` nodes can be); `?.` still
 * adds `undefined` when the selector matched nothing. */
const textOf = (doc: Document, selector: string): string | undefined =>
  doc.querySelector(selector)?.textContent;

const FALLBACK_TEXT_STYLE: CertificateTextElementStyle = {
  x: 50,
  y: 50,
  width: 70,
  fontFamily: 'Montserrat',
  fontSize: 16,
  color: '#1f2937',
  fontWeight: 600,
  textAlign: 'center',
  underline: false,
  horizontalLine: false,
};

const parseNewFormat = (doc: Document): DesignPatch => {
  const canvas = doc.querySelector('[data-element="canvas"]');
  const design: DesignPatch = {};
  // Only an explicitly-marked (admin-uploaded) background is recovered — an unmarked one is an
  // older background, so the design keeps the shipped artwork instead.
  if (
    canvas !== null &&
    canvas.getAttribute(CUSTOM_BACKGROUND_ATTR_NAME) === CUSTOM_BACKGROUND_ATTR_VALUE
  ) {
    const backgroundImage = readBackgroundImage(canvas);
    if (backgroundImage !== undefined) {
      design.backgroundImage = backgroundImage;
    }
  }
  const textFields = [
    ['heading', 'headingStyle'],
    ['kicker', 'kickerStyle'],
    ['bodyText', 'bodyTextStyle'],
  ] as const;
  for (const [contentKey, styleKey] of textFields) {
    const element = doc.querySelector(`[data-element="${contentKey}"]`);
    if (element !== null) {
      design[contentKey] = element.textContent;
      design[styleKey] = readTextStyle(element, FALLBACK_TEXT_STYLE);
    }
  }
  const nameElement = doc.querySelector('[data-element="name"]');
  if (nameElement !== null) {
    design.nameStyle = readTextStyle(nameElement, FALLBACK_TEXT_STYLE);
  }
  const qr = doc.querySelector('[data-element="qrcode"]');
  if (qr !== null) {
    design.qrStyle = readQrStyle(qr, { x: 88, y: 88, size: 64 });
  }
  return design;
};

/** Pre-redesign templates carry admin copy as plain text inside fixed layout classes — never a
 * background worth keeping (the old artwork is retired) or per-element position/font, so those
 * fall back to this kind's defaults and the admin re-lays-out the canvas once. */
const parseLegacyFormat = (doc: Document): DesignPatch => {
  const design: DesignPatch = {};
  const headingMain = textOf(doc, '.headingMain') ?? '';
  const headingSub = textOf(doc, '.headingSub') ?? '';
  if (headingMain.length > 0 || headingSub.length > 0) {
    design.heading = [headingMain, headingSub]
      .filter((part) => part.length > 0)
      .join('\n');
  }
  const kicker = textOf(doc, '.kicker');
  if (kicker !== undefined) {
    design.kicker = kicker;
  }
  const bodyText = textOf(doc, '.bodyText');
  if (bodyText !== undefined) {
    design.bodyText = bodyText;
  }
  return design;
};

/**
 * Reads a previously-saved certificate template's HTML back into structured design state. A
 * template built by this editor (marked with `data-element` attributes) round-trips fully —
 * positions, fonts, copy, and an admin-uploaded background (marked `data-background="custom"`;
 * any other background is an older one and is dropped). A pre-redesign template yields only its
 * admin-authored copy; positions/fonts weren't stored in that format, so the admin repositions
 * elements on the canvas once.
 */
export const parseCertificateTemplateHtml = (html: string): ParsedCertificateTemplate => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (doc.querySelector('[data-element="canvas"]') !== null) {
    return { format: 'new', design: parseNewFormat(doc) };
  }
  if (doc.querySelector('.frame') !== null) {
    return { format: 'legacy', design: parseLegacyFormat(doc) };
  }
  return { format: 'unknown', design: {} };
};
