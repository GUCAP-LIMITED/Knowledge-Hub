import { describe, expect, it } from 'vitest';
import type { CertificateDesign } from '../store/certificate-template-store';
import { buildCertificateTemplateHtml } from './certificate-template-html';
import { parseCertificateTemplateHtml } from './certificate-template-html-parser';

const DESIGN: CertificateDesign = {
  kind: 'course',
  backgroundImage: 'data:image/png;base64,bgbg',
  heading: 'Certificate of Completion',
  headingStyle: {
    x: 50,
    y: 20,
    width: 70,
    fontFamily: 'Montserrat',
    fontSize: 32,
    color: '#045d5e',
    fontWeight: 800,
    textAlign: 'center',
    underline: false,
    horizontalLine: false,
  },
  kicker: 'This is to certify that',
  kickerStyle: {
    x: 50,
    y: 34,
    width: 70,
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#64748b',
    fontWeight: 600,
    textAlign: 'left',
    underline: true,
    horizontalLine: false,
  },
  bodyText: 'for successfully completing {{courseName}}.',
  bodyTextStyle: {
    x: 50,
    y: 72,
    width: 80,
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#1f2937',
    fontWeight: 400,
    textAlign: 'center',
    underline: false,
    horizontalLine: false,
  },
  nameStyle: {
    x: 50,
    y: 46,
    width: 70,
    fontFamily: 'Lexend Deca',
    fontSize: 40,
    color: '#1f2937',
    fontWeight: 700,
    textAlign: 'center',
    underline: false,
    horizontalLine: true,
  },
  qrStyle: { x: 88, y: 88, size: 64 },
};

const LEGACY_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>course certificate template</title></head>
<body>
<div class="frame completion" style="--art-accent: #045d5e;">
<img src="https://academy-test.uapp.uk/certificates/course/top-right.svg" alt="" class="courseTopRight" />
<div class="">
<div class="body">
  <h2 class="heading">
    <span class="headingMain">Certificate</span>
    <span class="headingSub">Of Completion</span>
  </h2>
  <p class="kicker">This is to certify that</p>
  <p class="name">{{userName}}</p>
  <p class="bodyText">for successfully completing {{courseName}}, a course designed to strengthen the knowledge.

The course covered key areas of student counselling.</p>
</div>
<div class="footer"></div>
</div>
</div>
</body>
</html>`;

const LEGACY_HTML_WITH_BACKGROUND = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>course certificate template</title></head>
<body>
<div class="frame completion" style="--art-accent: #045d5e; background-image: url(/certificates/course/background.png);">
<div class="body">
  <h2 class="heading">
    <span class="headingMain">Certificate</span>
    <span class="headingSub">Of Completion</span>
  </h2>
  <p class="kicker">This is to certify that</p>
  <p class="name">{{userName}}</p>
  <p class="bodyText">for successfully completing {{courseName}}.</p>
</div>
</div>
</body>
</html>`;

describe('parseCertificateTemplateHtml', () => {
  it('round-trips a template built by this editor', () => {
    const html = buildCertificateTemplateHtml('course', DESIGN);
    const { format, design } = parseCertificateTemplateHtml(html);

    expect(format).toBe('new');
    expect(design.backgroundImage).toBe(DESIGN.backgroundImage);
    expect(design.heading).toBe(DESIGN.heading);
    expect(design.kicker).toBe(DESIGN.kicker);
    expect(design.bodyText).toBe(DESIGN.bodyText);
    expect(design.headingStyle).toEqual(DESIGN.headingStyle);
    expect(design.kickerStyle).toEqual(DESIGN.kickerStyle);
    expect(design.bodyTextStyle).toEqual(DESIGN.bodyTextStyle);
    expect(design.nameStyle).toEqual(DESIGN.nameStyle);
    expect(design.qrStyle).toEqual(DESIGN.qrStyle);
  });

  it('recovers a template with no background image', () => {
    const { backgroundImage: _omit, ...withoutBackground } = DESIGN;
    const html = buildCertificateTemplateHtml('course', withoutBackground);
    const { design } = parseCertificateTemplateHtml(html);
    expect(design.backgroundImage).toBeUndefined();
  });

  it('extracts heading/kicker/body copy from a pre-redesign (legacy) template', () => {
    const { format, design } = parseCertificateTemplateHtml(LEGACY_HTML);

    expect(format).toBe('legacy');
    expect(design.heading).toBe('Certificate\nOf Completion');
    expect(design.kicker).toBe('This is to certify that');
    expect(design.bodyText).toContain('for successfully completing {{courseName}}');
    expect(design.bodyText).toContain(
      'The course covered key areas of student counselling.',
    );
  });

  it('does not recover any position/font from a legacy template', () => {
    const { design } = parseCertificateTemplateHtml(LEGACY_HTML);
    expect(design.backgroundImage).toBeUndefined();
    expect(design.headingStyle).toBeUndefined();
    expect(design.nameStyle).toBeUndefined();
    expect(design.qrStyle).toBeUndefined();
  });

  it('drops the background of a legacy template, keeping only its copy', () => {
    const { format, design } = parseCertificateTemplateHtml(LEGACY_HTML_WITH_BACKGROUND);
    expect(format).toBe('legacy');
    expect(design.backgroundImage).toBeUndefined();
    expect(design.heading).toBe('Certificate\nOf Completion');
  });

  it('recovers only a background marked as admin-uploaded', () => {
    const marked = `<div data-element="canvas" data-background="custom" style="background-image: url(data:image/png;base64,AAAA);"></div>`;
    const unmarked = `<div data-element="canvas" style="background-image: url(data:image/png;base64,AAAA);"></div>`;

    expect(parseCertificateTemplateHtml(marked).design.backgroundImage).toBe(
      'data:image/png;base64,AAAA',
    );
    expect(parseCertificateTemplateHtml(unmarked).design.backgroundImage).toBeUndefined();
  });

  it('marks an uploaded background when building, but not the shipped one', () => {
    const shipped = buildCertificateTemplateHtml('course', {
      ...DESIGN,
      backgroundImage: '/certificates/course/background.png',
    });
    const custom = buildCertificateTemplateHtml('course', {
      ...DESIGN,
      backgroundImage: 'data:image/png;base64,AAAA',
    });

    expect(shipped).not.toContain('data-background="custom"');
    expect(custom).toContain('data-background="custom"');
    expect(parseCertificateTemplateHtml(custom).design.backgroundImage).toBe(
      'data:image/png;base64,AAAA',
    );
  });

  it('recognises neither shape as unknown, recovering nothing', () => {
    const { format, design } = parseCertificateTemplateHtml(
      '<html><body>plain</body></html>',
    );
    expect(format).toBe('unknown');
    expect(design).toEqual({});
  });
});
