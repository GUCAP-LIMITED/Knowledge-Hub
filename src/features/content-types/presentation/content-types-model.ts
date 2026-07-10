import { BookOpen, FolderOpen, Lightbulb, type LucideIcon } from 'lucide-react';
import type { ContentKind } from '../store/content-types-store';

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

/** Compact "time ago" label for the audit log and the Last Updated summary. */
export const relativeTime = (at: number): string => {
  const seconds = Math.round((Date.now() - at) / 1000);
  if (seconds < 60) {
    return 'just now';
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${String(minutes)}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${String(hours)}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${String(days)}d ago`;
};
