import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** The three catalog kinds that each carry their own admin-managed type list. */
export type ContentKind = 'course' | 'tutorial' | 'resource';

export const CONTENT_KINDS: readonly ContentKind[] = ['course', 'tutorial', 'resource'];

/** Key persisted in localStorage. Bump the suffix to re-seed defaults for returning users. */
const STORAGE_KEY = 'kh.content-types.v2';

// Seeded from the actual catalog data so the filters match existing content out of the box.
const DEFAULT_TYPES: Record<ContentKind, readonly string[]> = {
  course: ['Compliance', 'Leadership', 'Marketing', 'Onboarding', 'Operations', 'Sales'],
  tutorial: ['Applications', 'Documents', 'Reports', 'Settings', 'Students'],
  resource: [
    'Best Practices',
    'FAQs',
    'Getting Started',
    'Policies & SOPs',
    'Technical Guides',
    'Troubleshooting',
  ],
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
