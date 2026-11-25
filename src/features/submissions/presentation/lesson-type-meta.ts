import {
  Film,
  FileText,
  CheckSquare,
  Globe,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { LESSON_KIND } from '@features/content';
import type { LessonKind } from './upload-content-types';

export type LessonKindResolvable = LessonKind | number | null | undefined;

export interface LessonTypeMeta {
  readonly key: LessonKind;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly color: string;
  readonly opacity: number;
}

const KIND_NORMALIZE_MAP: Record<string, LessonKind> = {
  video: 'video',
  [LESSON_KIND.video]: 'video',
  pdf: 'pdf',
  [LESSON_KIND.pdf]: 'pdf',
  doc: 'pdf',
  document: 'pdf',
  quiz: 'quiz',
  [LESSON_KIND.quiz]: 'quiz',
  link: 'link',
  [LESSON_KIND.link]: 'link',
  external: 'link',
  assignment: 'assignment',
  [LESSON_KIND.assignment]: 'assignment',
};

const META_MAP: Record<LessonKind, LessonTypeMeta> = {
  video: {
    key: 'video',
    label: 'Video',
    icon: Film,
    color: 'var(--color-primary)',
    opacity: 0.8,
  },
  pdf: {
    key: 'pdf',
    label: 'Document',
    icon: FileText,
    color: 'var(--color-primary)',
    opacity: 0.8,
  },
  quiz: {
    key: 'quiz',
    label: 'Quiz',
    icon: CheckSquare,
    color: 'var(--color-success)',
    opacity: 0.9,
  },
  link: {
    key: 'link',
    label: 'Link',
    icon: Globe,
    color: 'var(--color-info, var(--color-primary))',
    opacity: 0.8,
  },
  assignment: {
    key: 'assignment',
    label: 'Assignment',
    icon: BookOpen,
    color: 'var(--color-primary)',
    opacity: 0.8,
  },
};

const DEFAULT_META: LessonTypeMeta = {
  key: 'video',
  label: 'Lesson',
  icon: BookOpen,
  color: 'var(--color-primary)',
  opacity: 0.8,
};

export const resolveLessonTypeMeta = (kind: LessonKindResolvable): LessonTypeMeta => {
  if (kind === null || kind === undefined) {
    return DEFAULT_META;
  }
  const normalizedKey = KIND_NORMALIZE_MAP[kind];
  if (!normalizedKey) {
    return DEFAULT_META;
  }
  return META_MAP[normalizedKey];
};

export const getLessonIconComponent = (kind: LessonKindResolvable): LucideIcon =>
  resolveLessonTypeMeta(kind).icon;
