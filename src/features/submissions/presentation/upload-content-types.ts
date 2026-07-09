import { BookOpen, FolderOpen, Lightbulb, type LucideIcon } from 'lucide-react';

export type ContentTypeKey = 'course' | 'tutorial' | 'resource';
export type StepKey = 'type' | 'file' | 'details' | 'curriculum' | 'review';

export interface UploadContentType {
  readonly key: ContentTypeKey;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly tagline: string;
  readonly bullets: readonly string[];
  readonly steps: readonly StepKey[];
}

/** A lesson within a curriculum section. */
export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly kind: LessonKind;
}

/** A curriculum section grouping ordered lessons. */
export interface Section {
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly Lesson[];
}

export type LessonKind = 'video' | 'pdf' | 'quiz' | 'assignment' | 'link';

export const LESSON_KINDS: readonly LessonKind[] = [
  'video',
  'pdf',
  'quiz',
  'assignment',
  'link',
];

/** The three creation tracks — choosing one reconfigures which steps appear. */
export const UPLOAD_CONTENT_TYPES: readonly UploadContentType[] = [
  {
    key: 'course',
    label: 'Course',
    icon: BookOpen,
    tagline: 'Structured, multi-lesson learning',
    bullets: [
      'Multiple lessons & sections',
      'Full curriculum builder',
      'Completion tracking',
      'Certificate eligible',
    ],
    steps: ['type', 'file', 'details', 'curriculum', 'review'],
  },
  {
    key: 'tutorial',
    label: 'Tutorial',
    icon: Lightbulb,
    tagline: 'Short, single-lesson how-to',
    bullets: [
      'One focused lesson',
      'Quick to publish',
      'Great for how-tos',
      'No curriculum needed',
    ],
    steps: ['type', 'file', 'details', 'review'],
  },
  {
    key: 'resource',
    label: 'Resource',
    icon: FolderOpen,
    tagline: 'Reference material & downloads',
    bullets: [
      'PDF · DOCX · PPTX · XLSX',
      'ZIP & images',
      'Instant to share',
      'No review needed',
    ],
    steps: ['type', 'file', 'details', 'review'],
  },
];

/** The ordered step keys for a chosen content type (defaults to the course flow). */
export const stepsFor = (key: ContentTypeKey | null): readonly StepKey[] =>
  UPLOAD_CONTENT_TYPES.find((type) => type.key === key)?.steps ?? ['type'];

/** Human label for a content type key. */
export const typeLabel = (key: ContentTypeKey | null): string =>
  UPLOAD_CONTENT_TYPES.find((type) => type.key === key)?.label ?? 'Content';

let sequence = 0;

/** Monotonic client-side id for curriculum sections/lessons (deterministic, no clock/random). */
export const nextId = (prefix: string): string => {
  sequence += 1;
  return `${prefix}-${String(sequence)}`;
};
