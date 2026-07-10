import type { ReactElement } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@shared/utils';
import type { UploadContentType } from './upload-content-types';
import styles from './UploadPage.module.css';

export interface ContentTypeCardProps {
  readonly type: UploadContentType;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

/** A large, clearly-selectable content-type option (radio semantics + hover/focus/selected states). */
export const ContentTypeCard = ({
  type,
  selected,
  onSelect,
}: ContentTypeCardProps): ReactElement => {
  const Icon = type.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(styles.typeCard, selected && styles.typeCardActive)}
      onClick={onSelect}
    >
      <span className={styles.typeIcon}>
        <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className={styles.typeMain}>
        <span className={styles.typeLabel}>{type.label}</span>
        <span className={styles.typeTagline}>{type.tagline}</span>
        <span className={styles.typeUse}>{type.useFor}</span>
      </span>
      <span className={styles.typeChoose}>
        <span className={styles.typeRadio} aria-hidden="true">
          {selected ? <Check size={15} strokeWidth={3} /> : null}
        </span>
        <span className={styles.typeCta}>
          {selected ? 'Selected' : type.selectCta}
          {selected ? null : <ArrowRight size={14} aria-hidden="true" />}
        </span>
      </span>
    </button>
  );
};
