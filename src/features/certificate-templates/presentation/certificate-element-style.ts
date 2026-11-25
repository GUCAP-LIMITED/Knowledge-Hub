import type { CSSProperties } from 'react';
import type {
  CertificateQrElementStyle,
  CertificateTextElementStyle,
} from '../store/certificate-template-store';

/** The signature-line rule's colour/thickness and the breathing room above it — shared with the
 * plain-HTML generator (`certificate-template-html.ts`) so the live canvas and the exported
 * template render the same line. */
export const HORIZONTAL_LINE_BORDER = '1px solid #cbd5e1';
export const HORIZONTAL_LINE_GAP = 6;

/**
 * Maps a stored element style to inline React CSS. Centre-anchored (`left`/`top` mark the
 * element's centre, offset back by `translate(-50%, -50%)`) so drag math never has to account for
 * the element's own size. Shared by the read-only renderer (`CertificateArtwork`) and the
 * interactive editor (`CertificateEditorCanvas`) so the two can never visually drift apart.
 */
export const textElementStyle = (style: CertificateTextElementStyle): CSSProperties => ({
  position: 'absolute',
  left: `${String(style.x)}%`,
  top: `${String(style.y)}%`,
  width: `${String(style.width)}%`,
  transform: 'translate(-50%, -50%)',
  fontFamily: style.fontFamily,
  fontSize: style.fontSize,
  color: style.color,
  fontWeight: style.fontWeight,
  textAlign: style.textAlign,
  textDecorationLine: style.underline ? 'underline' : 'none',
  borderBottom: style.horizontalLine ? HORIZONTAL_LINE_BORDER : 'none',
  paddingBottom: style.horizontalLine ? HORIZONTAL_LINE_GAP : 0,
});

export const qrElementStyle = (style: CertificateQrElementStyle): CSSProperties => ({
  position: 'absolute',
  left: `${String(style.x)}%`,
  top: `${String(style.y)}%`,
  width: style.size,
  height: style.size,
  transform: 'translate(-50%, -50%)',
});
