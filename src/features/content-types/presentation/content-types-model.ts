import { BookOpen, FolderOpen, Lightbulb, type LucideIcon } from 'lucide-react';

/** The three content tracks (matches the backend content-type map keys). */
export type ContentKind = 'course' | 'tutorial' | 'resource';
export const CONTENT_KINDS: readonly ContentKind[] = ['course', 'tutorial', 'resource'];

export interface KindMeta {
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

/** Presentation metadata for each catalog kind (labels + icons live in the view layer). */
export const KIND_META: Record<ContentKind, KindMeta> = {
  course: {
    label: 'Course',
    description: 'Types offered when uploading and filtering courses.',
    icon: BookOpen,
  },
  tutorial: {
    label: 'Tutorial',
    description: 'Types offered when uploading and filtering tutorials.',
    icon: Lightbulb,
  },
  resource: {
    label: 'Resource',
    description: 'Types offered when uploading and filtering resources.',
    icon: FolderOpen,
  },
};
