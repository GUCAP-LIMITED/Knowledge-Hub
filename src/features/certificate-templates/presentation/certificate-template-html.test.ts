import { describe, expect, it } from 'vitest';
import type {
  CertificateDesign,
  CertificateTextElementStyle,
} from '../store/certificate-template-store';
import { FIT_NAME_SCRIPT } from './certificate-fit-name-script';
import { buildCertificateTemplateHtml } from './certificate-template-html';

const style = (
  patch: Partial<CertificateTextElementStyle> & Pick<CertificateTextElementStyle, 'y'>,
): CertificateTextElementStyle => ({
  x: 50,
  width: 70,
  fontFamily: 'Montserrat',
  fontSize: 16,
  color: '#1f2937',
  fontWeight: 600,
  textAlign: 'center',
  underline: false,
  horizontalLine: false,
  ...patch,
});

const RESOURCE_DESIGN_NO_BACKGROUND: Omit<CertificateDesign, 'backgroundImage'> = {
  kind: 'resource',
  heading: 'Certificate Of Participation',
  headingStyle: style({ y: 20, fontSize: 32, fontWeight: 800 }),
  kicker: 'This certificate is awarded to',
  kickerStyle: style({ y: 34, fontSize: 14 }),
  bodyText: 'for successfully completing {{courseName}}.',
  bodyTextStyle: style({ y: 72, fontFamily: 'Inter', fontWeight: 400 }),
  nameStyle: style({ y: 46, fontFamily: 'Alex Brush', fontSize: 46, fontWeight: 700 }),
  qrStyle: { x: 88, y: 88, size: 64 },
};

const RESOURCE_DESIGN: CertificateDesign = {
  ...RESOURCE_DESIGN_NO_BACKGROUND,
  backgroundImage: 'data:image/png;base64,bgbg',
};

describe('buildCertificateTemplateHtml', () => {
  it('embeds the admin-uploaded background image directly', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN);
    expect(html).toContain('data:image/png;base64,bgbg');
  });

  it('renders no background style when no image has been uploaded', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN_NO_BACKGROUND);
    expect(html).not.toContain('background-image');
  });

  it('leaves the per-learner tokens untouched', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN);
    expect(html).toContain('{{userName}}');
    expect(html).toContain('{{courseName}}');
    expect(html).toContain('{{qrCode}}');
  });

  it('positions each element inline from its stored style', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN);
    expect(html).toContain('left: 50%; top: 46%');
    expect(html).toContain("font-family: 'Alex Brush', sans-serif");
    expect(html).toContain('font-size: 46px');
    expect(html).toContain('left: 88%; top: 88%');
    expect(html).toContain('width: 64px; height: 64px');
  });

  it('renders text-decoration-line: underline only for elements with underline on', () => {
    const html = buildCertificateTemplateHtml('resource', {
      ...RESOURCE_DESIGN,
      kickerStyle: { ...RESOURCE_DESIGN.kickerStyle, underline: true },
    });
    expect(html).toContain('text-decoration-line: underline;');
    expect(html).toContain('text-decoration-line: none;');
  });

  it('renders a border-bottom rule only for elements with the horizontal line on', () => {
    const html = buildCertificateTemplateHtml('resource', {
      ...RESOURCE_DESIGN,
      nameStyle: { ...RESOURCE_DESIGN.nameStyle, horizontalLine: true },
    });
    expect(html).toContain('border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;');
    expect(html).toContain('border-bottom: none; padding-bottom: 0px;');
  });

  it('bakes in the admin-authored heading/kicker/body copy directly, not as a token', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN);
    expect(html).toContain('Certificate Of Participation');
    expect(html).toContain('This certificate is awarded to');
    expect(html).toContain('for successfully completing {{courseName}}.');
  });

  it('tags every element with data-element so a saved template can be parsed back', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN);
    for (const element of ['canvas', 'heading', 'kicker', 'name', 'bodyText', 'qrcode']) {
      expect(html).toContain(`data-element="${element}"`);
    }
  });

  it('keeps the recipient name on one line and embeds the shrink-to-fit script', () => {
    const html = buildCertificateTemplateHtml('resource', RESOURCE_DESIGN);
    const nameSpan = /<span[^>]*data-element="name"[^>]*>/.exec(html)?.[0] ?? '';
    expect(nameSpan).toContain('white-space: nowrap');
    expect(html).toContain(`<script>${FIT_NAME_SCRIPT}</script>`);
  });

  it('escapes admin-authored text while leaving `{{ }}` tokens inside it untouched', () => {
    const html = buildCertificateTemplateHtml('resource', {
      ...RESOURCE_DESIGN,
      kicker: '<b>Tom & Jerry</b> {{courseName}}',
    });
    expect(html).toContain('&lt;b&gt;Tom &amp; Jerry&lt;/b&gt; {{courseName}}');
  });
});
