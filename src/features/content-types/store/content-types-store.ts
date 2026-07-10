import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** The three catalog kinds that each carry their own admin-managed type list. */
export type ContentKind = 'course' | 'tutorial' | 'resource';

export const CONTENT_KINDS: readonly ContentKind[] = ['course', 'tutorial', 'resource'];

/** moduleId → key persisted in localStorage. */
const STORAGE_KEY = 'kh.content-types.v1';

const DEFAULT_TYPES: Record<ContentKind, readonly string[]> = {
  course: ['Onboarding', 'Compliance', 'Leadership', 'Sales', 'Technical Guides'],
  tutorial: ['Getting Started', 'Best Practices', 'Troubleshooting', 'Applications'],
  resource: ['Policies & SOPs', 'Documents', 'FAQs', 'Reports', 'Marketing'],
};

export interface ContentTypesState {
  readonly types: Record<ContentKind, readonly string[]>;
  /** Add a trimmed type name to a kind; ignores blanks and case-insensitive duplicates. */
  readonly addType: (kind: ContentKind, name: string) => void;
  /** Remove a type from a kind. */
  readonly removeType: (kind: ContentKind, name: string) => void;
}

const withAdded = (list: readonly string[], name: string): readonly string[] => {
  const trimmed = name.trim();
  const exists = list.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  return trimmed === '' || exists ? list : [...list, trimmed];
};

/**
 * Thin client-only store for the editable content-type taxonomy. No backend exists, so the lists
 * live in localStorage; the Settings screen edits them and the upload wizard / catalog reads them.
 */
export const useContentTypesStore = create<ContentTypesState>()(
  persist(
    (set) => ({
      types: DEFAULT_TYPES,
      addType: (kind, name): void => {
        set((state) => ({
          types: { ...state.types, [kind]: withAdded(state.types[kind], name) },
        }));
      },
      removeType: (kind, name): void => {
        set((state) => ({
          types: {
            ...state.types,
            [kind]: state.types[kind].filter((t) => t !== name),
          },
        }));
      },
    }),
    { name: STORAGE_KEY },
  ),
);

/** Read the current type list for one kind (reactive). */
export const useContentTypes = (kind: ContentKind): readonly string[] =>
  useContentTypesStore((state) => state.types[kind]);
