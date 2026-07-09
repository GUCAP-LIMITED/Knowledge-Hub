import type { ReactElement } from 'react';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import { cn } from '@shared/utils';
import type { Section } from './upload-content-types';
import type { Details } from './upload-details';
import styles from './UploadPage.module.css';

export interface LearnerPreviewProps {
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly author: string;
  readonly compact: boolean;
}

/** The learner-facing card — exactly what publishing produces, shown in the preview frame. */
export const LearnerPreview = ({
  details,
  sections,
  author,
  compact,
}: LearnerPreviewProps): ReactElement => {
  const lessons = sections.reduce((n, section) => n + section.lessons.length, 0);
  return (
    <div className={cn(styles.preview, compact && styles.previewCompact)}>
      <div className={styles.previewHero}>
        <PlayCircle
          size={compact ? 30 : 40}
          aria-hidden="true"
          className={styles.previewPlay}
        />
      </div>
      <div className={styles.previewBody}>
        <div className={styles.previewTags}>
          {details.category !== '' ? (
            <span className={styles.previewTag}>{details.category}</span>
          ) : null}
          <span className={styles.previewTag}>{details.difficulty}</span>
        </div>
        <h3 className={styles.previewTitle}>{details.title || 'Untitled content'}</h3>
        {details.subtitle !== '' ? (
          <p className={styles.previewSubtitle}>{details.subtitle}</p>
        ) : null}
        <div className={styles.previewMeta}>
          {details.type === 'Course' ? (
            <span className={styles.previewMetaItem}>
              <BookOpen size={13} aria-hidden="true" /> {sections.length} sections ·{' '}
              {lessons} lessons
            </span>
          ) : null}
          {details.duration !== '' ? (
            <span className={styles.previewMetaItem}>
              <Clock size={13} aria-hidden="true" /> {details.duration} min
            </span>
          ) : null}
        </div>
        {details.description !== '' ? (
          <p className={styles.previewDesc}>{details.description}</p>
        ) : null}
        <p className={styles.previewAuthor}>By {author}</p>
      </div>
    </div>
  );
};
