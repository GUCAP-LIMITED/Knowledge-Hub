import type { ReactElement } from 'react';
import { BookOpen, Eye, ThumbsUp } from 'lucide-react';
import {
  Badge,
  CategoryBadge,
  RatingStars,
  StatusBadge,
  type BadgeTone,
} from '@shared/ui';
import { cn, sanitizeRichText, useHoverPreview } from '@shared/utils';
import type { Difficulty, Tutorial } from '../domain';
import { TutorialThumb } from './TutorialThumb';
import { TutorialCardActions } from './TutorialCardActions';
import { TutorialCardPreview } from './TutorialCardPreview';
import styles from './TutorialsPage.module.css';

const difficultyTone = (difficulty: Difficulty): BadgeTone => {
  if (difficulty === 'Advanced') {
    return 'danger';
  }
  return difficulty === 'Intermediate' ? 'warning' : 'success';
};

const relativeUpdated = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) {
    return 'Updated today';
  }
  if (days < 7) {
    return `Updated ${String(days)}d ago`;
  }
  if (days < 30) {
    return `Updated ${String(Math.floor(days / 7))}w ago`;
  }
  if (days < 365) {
    return `Updated ${String(Math.floor(days / 30))}mo ago`;
  }
  return `Updated ${String(Math.floor(days / 365))}y ago`;
};

const TutorialMetaRow = ({ tutorial }: { readonly tutorial: Tutorial }): ReactElement => (
  <span className={styles.metaRow}>
    <span className={styles.metaItem}>
      <BookOpen size={13} aria-hidden="true" /> 1 lesson
    </span>
    <RatingStars rating={tutorial.rating} reviewCount={tutorial.totalReviews} size="sm" />
    <span className={styles.metaItem}>
      <ThumbsUp size={13} aria-hidden="true" /> {tutorial.helpfulCount}
    </span>
    {tutorial.views > 0 ? (
      <span className={styles.metaItem}>
        <Eye size={13} aria-hidden="true" /> {tutorial.views.toLocaleString()}
      </span>
    ) : null}
    <span className={styles.metaItem}>{relativeUpdated(tutorial.updatedAt)}</span>
    {tutorial.isRecentlyUpdated(new Date()) ? (
      <Badge tone="success" size="sm">
        Updated
      </Badge>
    ) : null}
  </span>
);

export interface TutorialCardProps {
  readonly tutorial: Tutorial;
  readonly isBusy: boolean;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
}

const TutorialCardFace = ({
  tutorial,
  isBusy,
  onWatch,
  onEdit,
  onDelete,
}: TutorialCardProps): ReactElement => (
  <article className={styles.card}>
    <button
      type="button"
      className={styles.cardMain}
      aria-label={`Watch ${tutorial.title}`}
      onClick={() => {
        onWatch(tutorial);
      }}
    >
      <TutorialThumb
        duration={tutorial.duration}
        thumbnailUrl={tutorial.thumbnailUrl}
        title={tutorial.title}
      />
      <span className={styles.cardBody}>
        <span className={styles.cardTags}>
          <CategoryBadge category={tutorial.category} />
          {tutorial.isCompleted() ? (
            <StatusBadge tone="success" label="Completed" />
          ) : null}
          {tutorial.quizId ? (
            <Badge tone={tutorial.isQuizRequired ? 'primary' : 'neutral'} size="sm">
              {tutorial.isQuizRequired ? 'Quiz Required' : 'Quiz Included'}
            </Badge>
          ) : null}
          <span className={styles.diff}>
            <span
              className={cn(styles.diffDot, styles[difficultyTone(tutorial.difficulty)])}
            />
            {tutorial.difficulty}
          </span>
        </span>
        <span className={styles.cardTitle}>
          {tutorial.title}
          {tutorial.visibility === 'Team' ? (
            <span className={styles.visibilityBadge}>
              <Badge size="sm" tone="info">
                Team
              </Badge>
            </span>
          ) : tutorial.visibility === 'Private' ? (
            <span className={styles.visibilityBadge}>
              <Badge size="sm" tone="warning">
                Private
              </Badge>
            </span>
          ) : null}
        </span>
        <span
          className={styles.cardDesc}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(tutorial.description) }}
        />
        <TutorialMetaRow tutorial={tutorial} />
      </span>
    </button>

    <TutorialCardActions
      tutorial={tutorial}
      isBusy={isBusy}
      onWatch={onWatch}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </article>
);

/** Library card for a single tutorial: clickable video-style tile + secondary actions + hover preview. */
export const TutorialCard = (props: TutorialCardProps): ReactElement => {
  const hover = useHoverPreview();

  return (
    <div
      ref={hover.ref}
      className={styles.cardWrapper}
      onMouseEnter={hover.onMouseEnter}
      onMouseLeave={hover.onMouseLeave}
    >
      <TutorialCardFace {...props} />
      {hover.side ? (
        <TutorialCardPreview tutorial={props.tutorial} side={hover.side} />
      ) : null}
    </div>
  );
};
