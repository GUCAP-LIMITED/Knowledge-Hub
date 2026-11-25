import type { ReactElement } from 'react';
import { BookOpen, Clock, HelpCircle, PlayCircle } from 'lucide-react';
import { cn, sanitizeRichText, normalizeDuration } from '@shared/utils';
import type { QuizConfig, Section } from './upload-content-types';
import type { Details } from './upload-details';
import styles from './UploadPage.module.css';

export interface LearnerPreviewProps {
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly quiz?: QuizConfig | null | undefined;
  readonly author: string;
  readonly compact: boolean;
  readonly categoryName?: string | undefined;
}

const PreviewMeta = ({
  details,
  sections,
  quiz,
}: {
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly quiz?: QuizConfig | null | undefined;
}): ReactElement => {
  const lessons = sections.reduce((n, section) => n + section.lessons.length, 0);
  return (
    <div className={styles.previewMeta}>
      {details.type === 'Course' ? (
        <span className={styles.previewMetaItem}>
          <BookOpen size={13} aria-hidden="true" /> {sections.length} sections · {lessons}{' '}
          lessons
        </span>
      ) : null}
      {details.duration !== '' ? (
        <span className={styles.previewMetaItem}>
          <Clock size={13} aria-hidden="true" />{' '}
          {normalizeDuration(details.duration) || details.duration}
        </span>
      ) : null}
      {quiz && quiz.questions.length > 0 ? (
        <span className={styles.previewMetaItem}>
          <HelpCircle size={13} aria-hidden="true" /> {quiz.questions.length}{' '}
          {quiz.questions.length === 1 ? 'Quiz question' : 'Quiz questions'} ·{' '}
          {(quiz.isRequired ?? true) ? 'Required' : 'Optional'}
        </span>
      ) : null}
    </div>
  );
};

/** The learner-facing card — exactly what publishing produces, shown in the preview frame. */
export const LearnerPreview = ({
  details,
  sections,
  quiz,
  author,
  compact,
  categoryName,
}: LearnerPreviewProps): ReactElement => {
  const displayedCategory = categoryName ?? details.category;

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
          {displayedCategory !== '' ? (
            <span className={styles.previewTag}>{displayedCategory}</span>
          ) : null}
          <span className={styles.previewTag}>{details.difficulty}</span>
        </div>
        <h3 className={styles.previewTitle}>{details.title || 'Untitled content'}</h3>
        {details.subtitle !== '' ? (
          <p className={styles.previewSubtitle}>{details.subtitle}</p>
        ) : null}
        <PreviewMeta details={details} sections={sections} quiz={quiz} />
        {details.description !== '' ? (
          <div
            className={styles.previewDesc}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.description) }}
          />
        ) : null}
        <p className={styles.previewAuthor}>By {author}</p>
      </div>
    </div>
  );
};
