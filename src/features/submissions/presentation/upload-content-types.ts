import { BookOpen, FolderOpen, Lightbulb, type LucideIcon } from 'lucide-react';
import { generateGuid } from '@shared/utils';

export type ContentTypeKey = 'course' | 'tutorial' | 'resource';
export type StepKey = 'type' | 'file' | 'details' | 'curriculum' | 'preview' | 'studio';
export type SlotAccept = 'image' | 'video' | 'doc' | 'any' | 'single-lesson';

export interface VideoPlaylistItem {
  readonly clientId: string;
  readonly file?: File | undefined;
  readonly name: string;
  readonly sizeBytes: number;
  readonly externalUrl?: string | undefined;
  readonly displayOrder: number;
}

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
  /** One-line "Best for…" summary shown under the title. */
  readonly tagline: string;
  /** A short "Use for…" line describing typical uses. */
  readonly useFor: string;
  /** Microcopy on the selectable card's call to action, e.g. "Select Course". */
  readonly selectCta: string;
  readonly steps: readonly StepKey[];
  readonly slots: readonly UploadSlot[];
}

/** Human accept hint per slot kind. */
export const ACCEPT_LABEL: Record<SlotAccept, string> = {
  image: 'PNG, JPG, WEBP',
  video: 'MP4, MOV, WEBM',
  doc: 'PDF, DOCX, PPTX, XLSX',
  any: 'Video, docs or images',
  'single-lesson': 'One video file (MP4, MOV, WEBM)',
};

export interface QuizOption {
  readonly id?: string | null | undefined;
  readonly text: string;
  readonly isCorrect: boolean;
}

export interface QuizQuestion {
  readonly id?: string | null | undefined;
  readonly prompt: string;
  readonly displayOrder?: number | undefined;
  readonly options: readonly QuizOption[];
}

export interface QuizConfig {
  readonly id?: string | null | undefined;
  readonly title: string;
  readonly questions: readonly QuizQuestion[];
  readonly isRequired?: boolean | undefined;
  readonly passingPercentage?: number | undefined;
  readonly isMultipleAttemptAllowed?: boolean | undefined;
  readonly upgradeQuiz?: boolean | undefined;
  readonly version?: number | undefined;
}

/** A lesson within a curriculum section. */
export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly kind: LessonKind;
  readonly displayOrder?: number | null | undefined;
  readonly file?: File;
  readonly assignmentLocalFiles?: readonly File[];
  readonly quiz?: QuizConfig;
  readonly externalUrl?: string;
}

/** A curriculum section grouping ordered lessons. */
export interface Section {
  readonly id: string;
  readonly title: string;
  readonly displayOrder?: number | null | undefined;
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
    tagline: 'Best for structured learning.',
    useFor:
      'Onboarding, compliance, multi-lesson training, progress tracking, and certificates.',
    selectCta: 'Select Course',
    steps: ['type', 'details', 'studio'],
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
    tagline: 'Best for quick how-to lessons.',
    useFor: 'Short guides, process walkthroughs, and focused training.',
    selectCta: 'Select Tutorial',
    steps: ['type', 'details', 'file', 'preview'],
    slots: [
      {
        id: 'thumbnail',
        label: 'Tutorial thumbnail',
        hint: '16:9 recommended, min 1280×720',
        accept: 'image',
        single: true,
        required: true,
      },
    ],
  },
  {
    key: 'resource',
    label: 'Resource',
    icon: FolderOpen,
    tagline: 'Best for downloadable materials.',
    useFor: 'PDFs, documents, templates, images, spreadsheets, and files.',
    selectCta: 'Select Resource',
    steps: ['type', 'details', 'file', 'preview'],
    slots: [
      {
        id: 'thumbnail',
        label: 'Resource thumbnail',
        hint: '16:9 recommended, min 1280×720',
        accept: 'image',
        single: true,
        required: true,
      },
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

/** slotId → the real files the user has attached (kept in memory; not persisted in the draft). */
export type SlotFiles = Record<string, readonly File[]>;

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

/** Validates quiz questions, prompts, option completeness, and passing percentage. */
export const missingQuiz = (
  quiz: QuizConfig | undefined | null,
  label = 'Quiz',
): readonly string[] => {
  const missing: string[] = [];
  if (!quiz || quiz.questions.length === 0) {
    missing.push(`${label} needs at least one question`);
    return missing;
  }
  if (
    quiz.passingPercentage !== undefined &&
    (quiz.passingPercentage <= 0 || quiz.passingPercentage > 100)
  ) {
    missing.push(`${label} passing percentage must be between 1% and 100%`);
  }
  quiz.questions.forEach((q, i) => {
    if (!q.prompt.trim()) {
      missing.push(`${label} question ${String(i + 1)} needs a prompt`);
    }
    if (q.options.length < 2) {
      missing.push(`${label} question ${String(i + 1)} needs at least 2 options`);
    }
    if (!q.options.some((o) => o.isCorrect)) {
      missing.push(`${label} question ${String(i + 1)} needs a correct answer selected`);
    }
    if (q.options.some((o) => !o.text.trim())) {
      missing.push(`${label} question ${String(i + 1)} has empty option text`);
    }
  });
  return missing;
};

/** Human label for a content type key. */
export const typeLabel = (key: ContentTypeKey | null): string =>
  UPLOAD_CONTENT_TYPES.find((type) => type.key === key)?.label ?? 'Content';

/** Return a copy of `items` with the element at `from` moved by `delta` (no-op if out of range). */
export const moveInArray = <T>(
  items: readonly T[],
  from: number,
  delta: number,
): readonly T[] => {
  const to = from + delta;
  if (to < 0 || to >= items.length) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(from, 1);
  if (moved === undefined) {
    return items;
  }
  copy.splice(to, 0, moved);
  return copy;
};

/** Generates a valid UUID/GUID for curriculum sections/lessons/quizzes. */
export const nextId = (_prefix?: string): string => generateGuid();
