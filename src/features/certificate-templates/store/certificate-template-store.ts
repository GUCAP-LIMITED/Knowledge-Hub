import { create } from 'zustand';
import { defaultCertificateBackground, type CertificateKind } from '../domain';

export type { CertificateKind } from '../domain';

export const CERTIFICATE_KINDS: readonly CertificateKind[] = [
  'course',
  'tutorial',
  'resource',
];

/** Static elements: admin types the content directly, per kind. May reference `{{courseName}}`
 * (resolved per learner, same as `nameStyle`'s `{{userName}}`) wherever the admin places it —
 * there's no separate standalone course-name element competing for the same value. */
export type CertificateStaticElementId = 'heading' | 'kicker' | 'bodyText';
/** Dynamic elements: content is fixed per learner (a token or backend-rendered image); only
 * position/style is editable. */
export type CertificateDynamicElementId = 'name';
export type CertificateTextElementId =
  | CertificateStaticElementId
  | CertificateDynamicElementId;

const STATIC_ELEMENT_IDS: readonly CertificateStaticElementId[] = [
  'heading',
  'kicker',
  'bodyText',
];

/** Whether an element's content is admin-typed (editable directly on the canvas) rather than a
 * fixed per-learner token. */
export const isCertificateStaticElement = (
  element: CertificateTextElementId,
): element is CertificateStaticElementId =>
  (STATIC_ELEMENT_IDS as readonly string[]).includes(element);

export type CertificateTextAlign = 'left' | 'center' | 'right';
export type CertificateFontWeight = 400 | 600 | 700 | 800;

export interface CertificateTextElementStyle {
  /** Percentage of canvas width/height, anchored at the element's centre. */
  readonly x: number;
  readonly y: number;
  /** Percentage of canvas width — the text's wrap box. */
  readonly width: number;
  readonly fontFamily: string;
  /** Px, measured at the base canvas width. */
  readonly fontSize: number;
  readonly color: string;
  readonly fontWeight: CertificateFontWeight;
  readonly textAlign: CertificateTextAlign;
  readonly underline: boolean;
  /** A signature-style rule under the whole text box — distinct from `underline` (which follows
   * each line of text), this sits at a fixed distance below the box, so it reads as a clean line
   * under a script-font name instead of hugging cursive descenders. */
  readonly horizontalLine: boolean;
}

export interface CertificateQrElementStyle {
  /** Percentage of canvas width/height, anchored at the element's centre. */
  readonly x: number;
  readonly y: number;
  /** Px square, measured at the base canvas width. */
  readonly size: number;
}

export interface CertificateDesign {
  readonly kind: CertificateKind;
  /** The single background image — carries every decorative asset (corner artwork, seal, logo,
   * signature). Starts as the kind's shipped artwork (`defaultCertificateBackground`); an
   * admin upload is a data URL, and one recovered from a saved template may be a plain URL/path. */
  readonly backgroundImage?: string;
  /** Admin-authored copy. May contain `{{courseName}}`, resolved per learner like `nameStyle`'s
   * `{{userName}}` token in the exported HTML. */
  readonly heading: string;
  readonly headingStyle: CertificateTextElementStyle;
  readonly kicker: string;
  readonly kickerStyle: CertificateTextElementStyle;
  readonly bodyText: string;
  readonly bodyTextStyle: CertificateTextElementStyle;
  readonly nameStyle: CertificateTextElementStyle;
  readonly qrStyle: CertificateQrElementStyle;
}

const textStyle = (
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

const qrStyle = (): CertificateQrElementStyle => ({ x: 50, y: 88, size: 64 });

/** Course and resource read as left-aligned blocks starting near the canvas's left margin;
 * tutorial reads as a centred block. Mirrors the pre-redesign CSS convention (`.completion` and
 * `.participation:is(.resourceFrame)` were left-aligned; only plain `.participation` — tutorial —
 * was centred), so a design built fresh here looks like the one it replaces. */
const ALIGN_OVERRIDE_BY_KIND: Record<
  CertificateKind,
  Pick<CertificateTextElementStyle, 'x' | 'width' | 'textAlign'>
> = {
  course: { x: 42, width: 75, textAlign: 'left' },
  tutorial: { x: 50, width: 70, textAlign: 'center' },
  resource: { x: 42, width: 75, textAlign: 'left' },
};

/** Course used `Montserrat` for body copy in the pre-redesign CSS; tutorial/resource used
 * `Inter`. Kept per-kind so a fresh design's fonts match what the kind looked like before. */
const BODY_FONT_BY_KIND: Record<CertificateKind, string> = {
  course: 'Montserrat',
  tutorial: 'Inter',
  resource: 'Inter',
};

/** `{{courseName}}` is the only place the course/tutorial/resource title appears — there's no
 * separate standalone element for it. Kept to roughly one line so it can't grow tall enough to
 * run into the QR code below it — a longer, multi-paragraph blurb is a deliberate admin choice,
 * not a safe default here. */
const BODY_TEXT_BY_KIND: Record<CertificateKind, string> = {
  course: 'Awarded for successfully completing {{courseName}} with distinction.',
  tutorial: 'Awarded for successfully completing the {{courseName}} tutorial.',
  resource: 'Awarded for successfully completing the {{courseName}} learning resource.',
};

/** `nameStyle` defaults to orange (`#fc7300`) because the pre-redesign `.name` class — the
 * recipient name — was orange. */
const baseDesign = (
  kind: CertificateKind,
  nameFontFamily: string,
  nameFontSize: number,
): CertificateDesign => {
  const align = ALIGN_OVERRIDE_BY_KIND[kind];
  return {
    kind,
    backgroundImage: defaultCertificateBackground(kind),
    heading: 'Certificate of Completion',
    headingStyle: textStyle({
      y: 16,
      fontSize: 32,
      fontWeight: 800,
      color: '#045d5e',
      ...align,
    }),
    kicker: 'This is to certify that',
    kickerStyle: textStyle({ y: 28, fontSize: 14, color: '#64748b', ...align }),
    bodyText: BODY_TEXT_BY_KIND[kind],
    bodyTextStyle: textStyle({
      y: 62,
      fontFamily: BODY_FONT_BY_KIND[kind],
      fontSize: 14,
      fontWeight: 400,
      ...align,
    }),
    nameStyle: textStyle({
      y: 44,
      fontFamily: nameFontFamily,
      fontSize: nameFontSize,
      fontWeight: 700,
      color: '#fc7300',
      ...align,
    }),
    qrStyle: qrStyle(),
  };
};

const DEFAULT_DESIGNS: Record<CertificateKind, CertificateDesign> = {
  course: baseDesign('course', 'Lexend Deca', 40),
  tutorial: baseDesign('tutorial', 'Alex Brush', 46),
  resource: baseDesign('resource', 'Alex Brush', 46),
};

const STYLE_KEY_BY_ELEMENT: Record<
  CertificateTextElementId,
  'headingStyle' | 'kickerStyle' | 'bodyTextStyle' | 'nameStyle'
> = {
  heading: 'headingStyle',
  kicker: 'kickerStyle',
  bodyText: 'bodyTextStyle',
  name: 'nameStyle',
};

export interface CertificateTemplateState {
  readonly designs: Record<CertificateKind, CertificateDesign>;
  /** Whether `hydrateDesign` has already applied the backend's saved template for this kind this
   * session — guards against a background refetch silently overwriting in-progress local edits. */
  readonly hydratedKinds: Record<CertificateKind, boolean>;
  /** The background image last confirmed on the backend for this kind (via hydrate or a
   * successful save), defaulting to the kind's shipped artwork — `removeBackgroundImage` reverts
   * to this when the current image is an unsaved replacement, so cancelling a replace restores
   * the original. */
  readonly savedBackgroundImage: Record<CertificateKind, string>;
  readonly hydrateDesign: (
    kind: CertificateKind,
    patch: Partial<Omit<CertificateDesign, 'kind'>>,
  ) => void;
  readonly updateBackgroundImage: (
    kind: CertificateKind,
    backgroundImage: string,
  ) => void;
  /** Cancels an unsaved background replacement (reverts to the last-saved image) if one is
   * pending; otherwise the current image is the saved one, so this falls back to the kind's
   * shipped default artwork. */
  readonly removeBackgroundImage: (kind: CertificateKind) => void;
  /** Records the just-saved design's background as the new baseline — call after a successful
   * save so a later replace-then-remove reverts to what's actually on the backend now. */
  readonly markBackgroundSaved: (kind: CertificateKind) => void;
  readonly updateElementContent: (
    kind: CertificateKind,
    element: CertificateStaticElementId,
    content: string,
  ) => void;
  readonly updateTextStyle: (
    kind: CertificateKind,
    element: CertificateTextElementId,
    patch: Partial<CertificateTextElementStyle>,
  ) => void;
  readonly updateQrStyle: (
    kind: CertificateKind,
    patch: Partial<CertificateQrElementStyle>,
  ) => void;
  /** Merges a design patch without marking the kind as backend-hydrated — unlike `hydrateDesign`,
   * this is for the admin's own edits (e.g. syncing the raw HTML source editor back onto the
   * canvas), not the initial load, so it must never suppress the "no previous template" notice. */
  readonly applyDesignPatch: (
    kind: CertificateKind,
    patch: Partial<Omit<CertificateDesign, 'kind'>>,
  ) => void;
}

/** Cancels an unsaved background replacement by reverting to the saved baseline, or — if the
 * current image already *is* that baseline — falls back to the kind's shipped default artwork.
 * Split out so the store creator below stays within the file's function-size limit. */
const removeBackground = (
  state: CertificateTemplateState,
  kind: CertificateKind,
): Pick<CertificateTemplateState, 'designs'> => {
  const saved = state.savedBackgroundImage[kind];
  const isUnsavedReplacement = state.designs[kind].backgroundImage !== saved;
  const backgroundImage = isUnsavedReplacement
    ? saved
    : defaultCertificateBackground(kind);
  return {
    designs: { ...state.designs, [kind]: { ...state.designs[kind], backgroundImage } },
  };
};

/**
 * Client-side working copy of the three certificate designs (course/tutorial/resource — no more,
 * no less), held in memory only (not persisted to localStorage — a page reload re-hydrates from
 * the backend via `hydrateDesign`, so nothing is lost). Starts from these hardcoded defaults so
 * the editor never shows an empty canvas before the backend's template has loaded.
 */
export const useCertificateTemplateStore = create<CertificateTemplateState>()((set) => ({
  designs: DEFAULT_DESIGNS,
  hydratedKinds: { course: false, tutorial: false, resource: false },
  savedBackgroundImage: {
    course: defaultCertificateBackground('course'),
    tutorial: defaultCertificateBackground('tutorial'),
    resource: defaultCertificateBackground('resource'),
  },
  hydrateDesign: (kind, patch): void => {
    set((state) => ({
      designs: { ...state.designs, [kind]: { ...state.designs[kind], ...patch } },
      hydratedKinds: { ...state.hydratedKinds, [kind]: true },
      savedBackgroundImage: {
        ...state.savedBackgroundImage,
        [kind]: patch.backgroundImage ?? defaultCertificateBackground(kind),
      },
    }));
  },
  updateBackgroundImage: (kind, backgroundImage): void => {
    set((state) => ({
      designs: { ...state.designs, [kind]: { ...state.designs[kind], backgroundImage } },
    }));
  },
  removeBackgroundImage: (kind): void => {
    set((state) => removeBackground(state, kind));
  },
  markBackgroundSaved: (kind): void => {
    set((state) => ({
      savedBackgroundImage: {
        ...state.savedBackgroundImage,
        [kind]: state.designs[kind].backgroundImage ?? defaultCertificateBackground(kind),
      },
    }));
  },
  updateElementContent: (kind, element, content): void => {
    set((state) => ({
      designs: {
        ...state.designs,
        [kind]: { ...state.designs[kind], [element]: content },
      },
    }));
  },
  updateTextStyle: (kind, element, patch): void => {
    set((state) => {
      const design = state.designs[kind];
      const key = STYLE_KEY_BY_ELEMENT[element];
      return {
        designs: {
          ...state.designs,
          [kind]: { ...design, [key]: { ...design[key], ...patch } },
        },
      };
    });
  },
  updateQrStyle: (kind, patch): void => {
    set((state) => {
      const design = state.designs[kind];
      return {
        designs: {
          ...state.designs,
          [kind]: { ...design, qrStyle: { ...design.qrStyle, ...patch } },
        },
      };
    });
  },
  applyDesignPatch: (kind, patch): void => {
    set((state) => ({
      designs: { ...state.designs, [kind]: { ...state.designs[kind], ...patch } },
    }));
  },
}));

/** Reactively resolve the design for one content kind. */
export const useCertificateDesign = (kind: CertificateKind): CertificateDesign =>
  useCertificateTemplateStore((state) => state.designs[kind]);
