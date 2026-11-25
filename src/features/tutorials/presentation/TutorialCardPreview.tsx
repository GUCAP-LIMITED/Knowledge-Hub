import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn, sanitizeRichText } from '@shared/utils';
import type { Tutorial } from '../domain';
import styles from './TutorialsPage.module.css';

export interface TutorialCardPreviewProps {
  readonly tutorial: Tutorial;
  readonly side: 'left' | 'right';
}

/** Udemy-style hover preview: title, freshness, level/duration, and the full description. */
export const TutorialCardPreview = ({
  tutorial,
  side,
}: TutorialCardPreviewProps): ReactElement => {
  const navigate = useNavigate();
  const metaLine = `${tutorial.duration} · ${tutorial.difficulty}`;

  return (
    <div
      className={cn(
        styles.cardPreview,
        side === 'left' ? styles.cardPreviewLeft : styles.cardPreviewRight,
      )}
    >
      <div className={styles.cardPreviewScroll}>
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>{tutorial.title}</h3>
          {tutorial.subtitle ? (
            <p className={styles.previewSubtitle}>{tutorial.subtitle}</p>
          ) : null}
        </div>
        <p className={styles.previewUpdated}>
          Updated {tutorial.updatedAt.toLocaleDateString()}
        </p>
        <p className={styles.previewMeta}>{metaLine}</p>
        {tutorial.description ? (
          <div
            className={styles.previewDesc}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(tutorial.description) }}
          />
        ) : null}
      </div>
      <div className={styles.cardPreviewFooter}>
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            navigate(`/tutorials/${tutorial.slug || tutorial.id}`);
          }}
        >
          <Play size={14} aria-hidden="true" /> Watch tutorial
        </Button>
      </div>
    </div>
  );
};
