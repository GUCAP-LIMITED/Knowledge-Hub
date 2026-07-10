import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Which user type a template applies to ('all' = every learner). */
export type TemplateUserType = 'all' | 'admin' | 'manager' | 'consultant';

/** Which content kind a template applies to ('all' = every kind). */
export type TemplateKind = 'all' | 'course' | 'tutorial' | 'resource';

export const TEMPLATE_USER_TYPES: readonly TemplateUserType[] = [
  'all',
  'admin',
  'manager',
  'consultant',
];

export const TEMPLATE_KINDS: readonly TemplateKind[] = [
  'all',
  'course',
  'tutorial',
  'resource',
];

export interface CertificateTemplate {
  readonly id: string;
  readonly name: string;
  readonly userType: TemplateUserType;
  readonly contentKind: TemplateKind;
  /** Accent colour (hex) used for the certificate's frame and headings. */
  readonly accentColor: string;
  /** Optional uploaded background image, stored as a data URL (no backend). */
  readonly backgroundImage?: string;
}

const STORAGE_KEY = 'kh.certificate-templates.v1';

/** The always-present fallback used when nothing more specific matches. */
export const DEFAULT_TEMPLATE: CertificateTemplate = {
  id: 'default',
  name: 'Standard certificate',
  userType: 'all',
  contentKind: 'all',
  accentColor: '#045d5e',
};

export interface CertificateTemplateState {
  readonly templates: readonly CertificateTemplate[];
  readonly saveTemplate: (template: CertificateTemplate) => void;
  readonly removeTemplate: (id: string) => void;
}

/**
 * Thin client-only store for admin-authored certificate templates. No backend exists, so templates
 * (including uploaded background images) live in localStorage. The certificate view reads the best
 * match for the recipient's user type and the content kind.
 */
export const useCertificateTemplateStore = create<CertificateTemplateState>()(
  persist(
    (set) => ({
      templates: [DEFAULT_TEMPLATE],
      saveTemplate: (template): void => {
        set((state) => {
          const exists = state.templates.some((t) => t.id === template.id);
          return {
            templates: exists
              ? state.templates.map((t) => (t.id === template.id ? template : t))
              : [...state.templates, template],
          };
        });
      },
      removeTemplate: (id): void => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id || t.id === 'default'),
        }));
      },
    }),
    { name: STORAGE_KEY },
  ),
);

const score = (
  template: CertificateTemplate,
  userRoles: readonly string[],
  kind: TemplateKind,
): number => {
  const userMatch =
    template.userType === 'all' ? 1 : userRoles.includes(template.userType) ? 2 : -1;
  const kindMatch =
    template.contentKind === 'all' ? 1 : template.contentKind === kind ? 2 : -1;
  return userMatch < 0 || kindMatch < 0 ? -1 : userMatch + kindMatch;
};

/** Pick the most specific template matching the recipient's roles and the content kind. */
export const pickTemplate = (
  templates: readonly CertificateTemplate[],
  userRoles: readonly string[],
  kind: TemplateKind,
): CertificateTemplate => {
  let best = DEFAULT_TEMPLATE;
  let bestScore = -1;
  for (const template of templates) {
    const value = score(template, userRoles, kind);
    if (value > bestScore) {
      best = template;
      bestScore = value;
    }
  }
  return best;
};

/** Reactively resolve the certificate template for a recipient's roles and content kind. */
export const useCertificateTemplate = (
  userRoles: readonly string[],
  kind: TemplateKind,
): CertificateTemplate =>
  useCertificateTemplateStore((state) => pickTemplate(state.templates, userRoles, kind));

let sequence = 0;

/** Monotonic client-side id for new templates (deterministic, no clock/random). */
export const nextTemplateId = (): string => {
  sequence += 1;
  return `tpl-${String(sequence)}`;
};
