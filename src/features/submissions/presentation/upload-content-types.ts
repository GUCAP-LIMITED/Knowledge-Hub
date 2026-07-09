import { BookOpen, FolderOpen, Lightbulb, type LucideIcon } from 'lucide-react';

export type ContentTypeKey = 'course' | 'tutorial' | 'resource';
export type StepKey = 'type' | 'file' | 'details' | 'curriculum' | 'preview';
export type SlotAccept = 'image' | 'video' | 'doc' | 'any' | 'single-lesson';

/** A named upload target shown as its own card in the upload step. */
export interface UploadSlot {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly accept: SlotAccept;
  readonly single?: boolean;
  readonly required?: boolean;
}

export interface UploadContentType {
  readonly key: ContentTypeKey;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly tagline: string;
  readonly bullets: readonly string[];
  readonly steps: readonly StepKey[];
  readonly slots: readonly UploadSlot[];
}

/** Human accept hint per slot kind. */
export const ACCEPT_LABEL: Record<SlotAccept, string> = {
  image: 'PNG, JPG, WEBP',
  video: 'MP4, MOV, WEBM',
  doc: 'PDF, DOCX, PPTX, XLSX',
  any: 'Video, docs or images',
  'single-lesson': 'One video, PDF or document',
};

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
    steps: ['type', 'file', 'details', 'curriculum', 'preview'],
    slots: [
      {
        id: 'thumbnail',
        label: 'Course thumbnail',
        hint: '16:9 recommended, min 1280×720',
        accept: 'image',
        single: true,
        required: true,
      },
      {
        id: 'intro',
        label: 'Intro / promo video',
        hint: 'Short trailer shown on the course page',
        accept: 'video',
        single: true,
      },
      {
        id: 'lessons',
        label: 'Lesson videos & files',
        hint: 'Add all lesson media — arrange them in the curriculum next',
        accept: 'any',
      },
      {
        id: 'resources',
        label: 'Supporting resources',
        hint: 'PDFs, slides, worksheets learners can download',
        accept: 'doc',
      },
    ],
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
    steps: ['type', 'file', 'details', 'preview'],
    slots: [
      {
        id: 'primary',
        label: 'Tutorial content',
        hint: 'One video, PDF, or document',
        accept: 'single-lesson',
        single: true,
        required: true,
      },
    ],
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
    steps: ['type', 'file', 'details', 'preview'],
    slots: [
      {
        id: 'files',
        label: 'Reference files',
        hint: 'The first file is the primary one learners see',
        accept: 'doc',
        required: true,
      },
    ],
  },
];

/** A file the user has attached to a slot. */
export interface PickedFile {
  readonly name: string;
  readonly size: number;
}

/** slotId → attached files. */
export type SlotFiles = Record<string, readonly PickedFile[]>;

/** The ordered step keys for a chosen content type (defaults to the course flow). */
export const stepsFor = (key: ContentTypeKey | null): readonly StepKey[] =>
  UPLOAD_CONTENT_TYPES.find((type) => type.key === key)?.steps ?? ['type'];

/** The upload slots for a chosen content type. */
export const slotsFor = (key: ContentTypeKey | null): readonly UploadSlot[] =>
  UPLOAD_CONTENT_TYPES.find((type) => type.key === key)?.slots ?? [];

/** True when every required slot has at least one file. */
export const requiredSlotsFilled = (
  key: ContentTypeKey | null,
  files: SlotFiles,
): boolean =>
  slotsFor(key)
    .filter((slot) => slot.required === true)
    .every((slot) => (files[slot.id]?.length ?? 0) > 0);

/** Total number of attached files across every slot. */
export const totalFileCount = (files: SlotFiles): number =>
  Object.values(files).reduce((sum, list) => sum + list.length, 0);

/** Human label for a content type key. */
export const typeLabel = (key: ContentTypeKey | null): string =>
  UPLOAD_CONTENT_TYPES.find((type) => type.key === key)?.label ?? 'Content';

let sequence = 0;

/** Monotonic client-side id for curriculum sections/lessons (deterministic, no clock/random). */
export const nextId = (prefix: string): string => {
  sequence += 1;
  return `${prefix}-${String(sequence)}`;
};
