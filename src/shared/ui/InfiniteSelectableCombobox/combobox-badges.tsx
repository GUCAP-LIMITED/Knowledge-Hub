import type { ReactElement } from 'react';
import { BookOpen, Lightbulb, FolderOpen } from 'lucide-react';
import { cn } from '@shared/utils';
import styles from './InfiniteSelectableCombobox.module.css';

export const ComboboxTypeBadge = ({
  type,
  typeName,
  compact,
}: {
  readonly type?: number | undefined;
  readonly typeName?: string | undefined;
  readonly compact?: boolean | undefined;
}): ReactElement | null => {
  if (type === undefined && !typeName) {
    return null;
  }

  let badgeClass = styles.typeDefault;
  let Icon = BookOpen;

  if (type === 0) {
    badgeClass = styles.typeCourse;
    Icon = BookOpen;
  } else if (type === 5) {
    badgeClass = styles.typeTutorial;
    Icon = Lightbulb;
  } else if (type === 10) {
    badgeClass = styles.typeResource;
    Icon = FolderOpen;
  }

  return (
    <span
      className={cn(styles.typeBadge, badgeClass, compact && styles.typeBadgeCompact)}
    >
      <Icon size={compact ? 7 : 11} aria-hidden="true" />
      {typeName ?? 'Item'}
    </span>
  );
};

export const HighlightedText = ({
  text,
  query,
}: {
  readonly text: string;
  readonly query: string;
}): ReactElement => {
  const trimmed = query.trim();
  if (!trimmed) {
    return <>{text}</>;
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};
