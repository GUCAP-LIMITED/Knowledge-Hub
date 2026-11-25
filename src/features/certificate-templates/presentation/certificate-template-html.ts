import { defaultCertificateBackground } from '../domain';
import type {
  CertificateDesign,
  CertificateQrElementStyle,
  CertificateTextElementStyle,
} from '../store/certificate-template-store';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './certificate-canvas-geometry';
import { HORIZONTAL_LINE_BORDER, HORIZONTAL_LINE_GAP } from './certificate-element-style';
import { FIT_NAME_SCRIPT } from './certificate-fit-name-script';
import { CERTIFICATE_TEMPLATE_CSS } from './certificate-template-css';
import {
  CUSTOM_BACKGROUND_ATTR_NAME,
  CUSTOM_BACKGROUND_ATTR_VALUE,
  escapeHtml,
} from './certificate-template-html-utils';

const centredInlineStyle = (x: number, y: number, extra: string): string =>
  `left: ${String(x)}%; top: ${String(y)}%; transform: translate(-50%, -50%); ${extra}`;

const textElementInlineStyle = (style: CertificateTextElementStyle): string =>
  centredInlineStyle(
    style.x,
    style.y,
    `width: ${String(style.width)}%; font-family: '${style.fontFamily}', sans-serif; ` +
      `font-size: ${String(style.fontSize)}px; color: ${style.color}; ` +
      `font-weight: ${String(style.fontWeight)}; text-align: ${style.textAlign}; ` +
      `text-decoration-line: ${style.underline ? 'underline' : 'none'}; ` +
      `border-bottom: ${style.horizontalLine ? HORIZONTAL_LINE_BORDER : 'none'}; ` +
      `padding-bottom: ${String(style.horizontalLine ? HORIZONTAL_LINE_GAP : 0)}px;`,
  );

const qrElementInlineStyle = (style: CertificateQrElementStyle): string =>
  centredInlineStyle(
    style.x,
    style.y,
    `width: ${String(style.size)}px; height: ${String(style.size)}px;`,
  );

/** A static, admin-authored text element — content is escaped (untrusted input at this boundary)
 * but any `{{courseName}}`/`{{userName}}` tokens inside it survive, since escaping only touches
 * `& < > " '`, for the backend to fill in per learner. `data-element` marks which design field
 * this is, so `certificate-template-html-parser` can read a previously-saved template back into
 * structured state without guessing from DOM order. */
const staticTextSpan = (
  element: 'heading' | 'kicker' | 'bodyText',
  content: string,
  style: CertificateTextElementStyle,
): string =>
  `<span class="el" data-element="${element}" style="${textElementInlineStyle(style)}">${escapeHtml(content)}</span>`;

/** The recipient name stays on one line (`white-space: nowrap`) — `FIT_NAME_SCRIPT` shrinks the font
 * for long names, so the element's height never changes and its underline can't collide with the
 * body copy below. */
const nameTokenSpan = (style: CertificateTextElementStyle): string =>
  `<span class="el" data-element="name" style="${textElementInlineStyle(style)} white-space: nowrap;">{{userName}}</span>`;

/**
 * Serialise one certificate design into a complete, self-contained HTML document: a fixed-size
 * canvas with the admin-uploaded background image (carrying every decorative asset — corner
 * artwork, seal, logo, signature) and five absolutely-positioned overlay elements: heading,
 * kicker, body copy, recipient name, and QR code. `{{userName}}` and `{{qrCode}}` are left as
 * literal tokens for the backend to fill in per learner; `{{courseName}}` isn't a dedicated
 * element — it's a token the admin can place inside heading/kicker/body copy directly. Synchronous
 * and cheap — every save sends the *current* element content/positions/styles, so a frontend UI
 * change ships automatically without a manual backend hand-off.
 */
export const buildCertificateTemplateHtml = (
  kind: CertificateDesign['kind'],
  design: CertificateDesign,
): string => {
  const backgroundStyle =
    design.backgroundImage !== undefined
      ? ` background-image: url(${design.backgroundImage});`
      : '';
  // Marks an admin-uploaded background so a reload keeps it; any template without the marker
  // carries an older background that `parseCertificateTemplateHtml` deliberately ignores.
  const isCustomBackground =
    design.backgroundImage !== undefined &&
    design.backgroundImage !== defaultCertificateBackground(kind);
  const customBackgroundAttr = isCustomBackground
    ? ` ${CUSTOM_BACKGROUND_ATTR_NAME}="${CUSTOM_BACKGROUND_ATTR_VALUE}"`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(kind)} certificate template</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Lexend+Deca:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Alex+Brush&display=swap" rel="stylesheet" />
<style>${CERTIFICATE_TEMPLATE_CSS}</style>
</head>
<body>
<div class="canvas" data-element="canvas"${customBackgroundAttr} style="width: ${String(CANVAS_WIDTH)}px; height: ${String(CANVAS_HEIGHT)}px;${backgroundStyle}">
${staticTextSpan('heading', design.heading, design.headingStyle)}
${staticTextSpan('kicker', design.kicker, design.kickerStyle)}
${nameTokenSpan(design.nameStyle)}
${staticTextSpan('bodyText', design.bodyText, design.bodyTextStyle)}
<img class="el elQr" data-element="qrcode" style="${qrElementInlineStyle(design.qrStyle)}" alt="Verify QR code" src="{{qrCode}}" />
</div>
<script>${FIT_NAME_SCRIPT}</script>
</body>
</html>`;
};
