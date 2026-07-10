import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** The three catalog kinds that each carry their own admin-managed type list. */
export type ContentKind = 'course' | 'tutorial' | 'resource';

export const CONTENT_KINDS: readonly ContentKind[] = ['course', 'tutorial', 'resource'];

/** Outcome of an add attempt, so the UI can give success / duplicate / empty feedback. */
export type AddResult = 'added' | 'duplicate' | 'empty';

/** One accountability entry in the audit log. */
export interface ActivityEntry {
  readonly id: string;
  readonly kind: ContentKind;
  readonly name: string;
  readonly action: 'added' | 'removed';
  readonly actor: string;
  readonly at: number;
}

/** Key persisted in localStorage. Bump the suffix to re-seed defaults for returning users. */
const STORAGE_KEY = 'kh.content-types.v2';

const ACTIVITY_LIMIT = 40;

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
  readonly activity: readonly ActivityEntry[];
  /** Add a trimmed type name to a kind. Returns whether it was added, a duplicate, or empty. */
  readonly addType: (kind: ContentKind, name: string, actor?: string) => AddResult;
  /** Remove a type from a kind and record the change. */
  readonly removeType: (kind: ContentKind, name: string, actor?: string) => void;
}

let sequence = 0;
const nextId = (): string => {
  sequence += 1;
  return `act-${String(sequence)}`;
};

const entry = (
  action: ActivityEntry['action'],
  kind: ContentKind,
  name: string,
  actor: string,
): ActivityEntry => ({ id: nextId(), kind, name, action, actor, at: Date.now() });

const isDuplicate = (list: readonly string[], name: string): boolean =>
  list.some((t) => t.toLowerCase() === name.toLowerCase());

/**
 * Thin client-only store for the editable content-type taxonomy. No backend exists, so the lists
 * (and a small audit log) live in localStorage; the Settings screen edits them and the upload
 * wizard / catalog reads them.
 */
export const useContentTypesStore = create<ContentTypesState>()(
  persist(
    (set, get) => ({
      types: DEFAULT_TYPES,
      activity: [],
      addType: (kind, name, actor = 'Admin'): AddResult => {
        const trimmed = name.trim();
        if (trimmed === '') {
          return 'empty';
        }
        const list = get().types[kind];
        if (isDuplicate(list, trimmed)) {
          return 'duplicate';
        }
        set((state) => ({
          types: { ...state.types, [kind]: [...list, trimmed] },
          activity: [entry('added', kind, trimmed, actor), ...state.activity].slice(
            0,
            ACTIVITY_LIMIT,
          ),
        }));
        return 'added';
      },
      removeType: (kind, name, actor = 'Admin'): void => {
        set((state) => ({
          types: {
            ...state.types,
            [kind]: state.types[kind].filter((t) => t !== name),
          },
          activity: [entry('removed', kind, name, actor), ...state.activity].slice(
            0,
            ACTIVITY_LIMIT,
          ),
        }));
      },
    }),
    { name: STORAGE_KEY },
  ),
);

/** Read the current type list for one kind (reactive). */
export const useContentTypes = (kind: ContentKind): readonly string[] =>
  useContentTypesStore((state) => state.types[kind]);
