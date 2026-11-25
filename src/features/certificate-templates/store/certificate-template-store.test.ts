import { beforeEach, describe, expect, it } from 'vitest';
import { useCertificateTemplateStore } from './certificate-template-store';

const INITIAL_DESIGNS = useCertificateTemplateStore.getState().designs;
const INITIAL_SAVED_BACKGROUND =
  useCertificateTemplateStore.getState().savedBackgroundImage;

describe('useCertificateTemplateStore', () => {
  beforeEach(() => {
    useCertificateTemplateStore.setState({
      designs: INITIAL_DESIGNS,
      savedBackgroundImage: INITIAL_SAVED_BACKGROUND,
    });
  });

  it('seeds exactly one design per content kind', () => {
    const { designs } = useCertificateTemplateStore.getState();
    expect(Object.keys(designs).sort()).toEqual(['course', 'resource', 'tutorial']);
  });

  it('defaults course and resource to left-aligned text, and tutorial to centred — matching the pre-redesign CSS convention', () => {
    const { designs } = useCertificateTemplateStore.getState();
    for (const kind of ['course', 'resource'] as const) {
      for (const style of [
        designs[kind].headingStyle,
        designs[kind].kickerStyle,
        designs[kind].bodyTextStyle,
        designs[kind].nameStyle,
      ]) {
        expect(style.textAlign).toBe('left');
      }
    }
    for (const style of [
      designs.tutorial.headingStyle,
      designs.tutorial.kickerStyle,
      designs.tutorial.bodyTextStyle,
      designs.tutorial.nameStyle,
    ]) {
      expect(style.textAlign).toBe('center');
    }
  });

  it('includes {{courseName}} in the default body copy — there is no separate course-name element to show it instead', () => {
    const { designs } = useCertificateTemplateStore.getState();
    for (const kind of ['course', 'tutorial', 'resource'] as const) {
      expect(designs[kind].bodyText).toContain('{{courseName}}');
    }
  });

  it('defaults body copy to Montserrat for course and Inter for tutorial/resource — matching the pre-redesign CSS', () => {
    const { designs } = useCertificateTemplateStore.getState();
    expect(designs.course.bodyTextStyle.fontFamily).toBe('Montserrat');
    expect(designs.tutorial.bodyTextStyle.fontFamily).toBe('Inter');
    expect(designs.resource.bodyTextStyle.fontFamily).toBe('Inter');
  });

  it('defaults the recipient name to orange — matching the pre-redesign `.name` colour', () => {
    const { designs } = useCertificateTemplateStore.getState();
    for (const kind of ['course', 'tutorial', 'resource'] as const) {
      expect(designs[kind].nameStyle.color).toBe('#fc7300');
    }
  });

  it('seeds every design with its kind’s shipped background', () => {
    const { designs } = useCertificateTemplateStore.getState();
    for (const kind of ['course', 'tutorial', 'resource'] as const) {
      expect(designs[kind].backgroundImage).toBe(`/certificates/${kind}/background.png`);
    }
  });

  it('keeps the shipped background when a hydrated template carries none', () => {
    useCertificateTemplateStore.getState().hydrateDesign('tutorial', { heading: 'Hi' });

    const state = useCertificateTemplateStore.getState();
    expect(state.designs.tutorial.backgroundImage).toBe(
      '/certificates/tutorial/background.png',
    );
    expect(state.savedBackgroundImage.tutorial).toBe(
      '/certificates/tutorial/background.png',
    );
  });

  it('uses a hydrated template’s own background as the saved baseline', () => {
    useCertificateTemplateStore
      .getState()
      .hydrateDesign('course', { backgroundImage: 'saved.png' });

    const state = useCertificateTemplateStore.getState();
    expect(state.designs.course.backgroundImage).toBe('saved.png');
    expect(state.savedBackgroundImage.course).toBe('saved.png');
  });

  it('updates only the targeted kind’s background image, leaving the others untouched', () => {
    const before = useCertificateTemplateStore.getState().designs;
    useCertificateTemplateStore
      .getState()
      .updateBackgroundImage('tutorial', 'data:image/png;x');

    const after = useCertificateTemplateStore.getState().designs;
    expect(after.tutorial.backgroundImage).toBe('data:image/png;x');
    expect(after.course).toBe(before.course);
    expect(after.resource).toBe(before.resource);
  });

  it('reverts to the last-saved background when removing an unsaved replacement', () => {
    useCertificateTemplateStore
      .getState()
      .hydrateDesign('course', { backgroundImage: 'saved.png' });
    useCertificateTemplateStore
      .getState()
      .updateBackgroundImage('course', 'data:image/png;replacement');

    useCertificateTemplateStore.getState().removeBackgroundImage('course');

    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      'saved.png',
    );
  });

  it('falls back to the shipped background when there is no unsaved replacement to cancel', () => {
    useCertificateTemplateStore
      .getState()
      .hydrateDesign('course', { backgroundImage: 'saved.png' });

    useCertificateTemplateStore.getState().removeBackgroundImage('course');

    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      '/certificates/course/background.png',
    );
  });

  it('markBackgroundSaved moves the baseline, so a later remove reverts to the newly-saved image', () => {
    useCertificateTemplateStore
      .getState()
      .updateBackgroundImage('course', 'data:image/png;newly-saved');
    useCertificateTemplateStore.getState().markBackgroundSaved('course');

    useCertificateTemplateStore
      .getState()
      .updateBackgroundImage('course', 'data:image/png;another-replacement');
    useCertificateTemplateStore.getState().removeBackgroundImage('course');

    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      'data:image/png;newly-saved',
    );
  });

  it('merges a partial patch onto a text element’s style', () => {
    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'name', { fontSize: 60, color: '#ff0000' });

    const { nameStyle } = useCertificateTemplateStore.getState().designs.course;
    expect(nameStyle.fontSize).toBe(60);
    expect(nameStyle.color).toBe('#ff0000');
    expect(nameStyle.fontFamily).toBe('Lexend Deca');
  });

  it('defaults every text element to no underline, and can toggle it on independently', () => {
    const { designs } = useCertificateTemplateStore.getState();
    for (const kind of ['course', 'tutorial', 'resource'] as const) {
      for (const style of [
        designs[kind].headingStyle,
        designs[kind].kickerStyle,
        designs[kind].bodyTextStyle,
        designs[kind].nameStyle,
      ]) {
        expect(style.underline).toBe(false);
      }
    }

    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'kicker', { underline: true });

    const { kickerStyle, headingStyle } =
      useCertificateTemplateStore.getState().designs.course;
    expect(kickerStyle.underline).toBe(true);
    expect(headingStyle.underline).toBe(false);
  });

  it('defaults every text element to no horizontal line, and can toggle it on independently', () => {
    const { designs } = useCertificateTemplateStore.getState();
    for (const kind of ['course', 'tutorial', 'resource'] as const) {
      for (const style of [
        designs[kind].headingStyle,
        designs[kind].kickerStyle,
        designs[kind].bodyTextStyle,
        designs[kind].nameStyle,
      ]) {
        expect(style.horizontalLine).toBe(false);
      }
    }

    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'name', { horizontalLine: true });

    const { nameStyle, headingStyle } =
      useCertificateTemplateStore.getState().designs.course;
    expect(nameStyle.horizontalLine).toBe(true);
    expect(headingStyle.horizontalLine).toBe(false);
  });

  it('updates the name style independently of the heading style', () => {
    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'name', { textAlign: 'right' });

    const { headingStyle, nameStyle } =
      useCertificateTemplateStore.getState().designs.course;
    expect(nameStyle.textAlign).toBe('right');
    expect(headingStyle.textAlign).toBe(INITIAL_DESIGNS.course.headingStyle.textAlign);
  });

  it('merges a partial patch onto the QR element’s style', () => {
    useCertificateTemplateStore.getState().updateQrStyle('resource', { size: 96 });
    const { qrStyle } = useCertificateTemplateStore.getState().designs.resource;
    expect(qrStyle.size).toBe(96);
  });

  it('updates a static element’s admin-authored content', () => {
    useCertificateTemplateStore
      .getState()
      .updateElementContent('course', 'kicker', 'Awarded with distinction to');

    const { course } = useCertificateTemplateStore.getState().designs;
    expect(course.kicker).toBe('Awarded with distinction to');
    expect(course.heading).toBe(INITIAL_DESIGNS.course.heading);
  });

  it('merges a partial patch onto the heading/kicker/body-copy styles independently', () => {
    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'heading', { fontSize: 48 });
    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'kicker', { fontSize: 10 });
    useCertificateTemplateStore
      .getState()
      .updateTextStyle('course', 'bodyText', { textAlign: 'left' });

    const { headingStyle, kickerStyle, bodyTextStyle } =
      useCertificateTemplateStore.getState().designs.course;
    expect(headingStyle.fontSize).toBe(48);
    expect(kickerStyle.fontSize).toBe(10);
    expect(bodyTextStyle.textAlign).toBe('left');
  });
});
