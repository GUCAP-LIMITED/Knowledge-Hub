import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui';
import { cn, sanitizeRichText } from '@shared/utils';
import type { MyLearningItem } from '../domain/entities/my-learning-item';
import { getLearningItemRoute } from './my-learning-routes';
import styles from './MyLearningCard.module.css';

export interface MyLearningCardPreviewProps {
  readonly item: MyLearningItem;
  readonly side: 'left' | 'right';
}

const buildMetaLine = (item: MyLearningItem): string => {
  const parts = [item.contentTypeName];
  if (item.difficultyName) {
    parts.push(item.difficultyName);
  }
  const duration = item.formattedDuration();
  if (duration) {
    parts.push(duration);
  }
  return parts.join(' · ');
};

/** Hover preview for a My Learning card, mirroring the catalog cards' preview flyout. */
export const MyLearningCardPreview = ({
  item,
  side,
}: MyLearningCardPreviewProps): ReactElement => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        styles.cardPreview,
        side === 'left' ? styles.cardPreviewLeft : styles.cardPreviewRight,
      )}
    >
      <div className={styles.cardPreviewScroll}>
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>{item.title}</h3>
          {item.subtitle ? (
            <p className={styles.previewSubtitle}>{item.subtitle}</p>
          ) : null}
        </div>
        <p className={styles.previewMeta}>{buildMetaLine(item)}</p>
        {item.description ? (
          <div
            className={styles.previewDesc}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.description) }}
          />
        ) : null}
      </div>
      <div className={styles.cardPreviewFooter}>
        <Button
          size="sm"
          variant="default"
          fullWidth
          onClick={() => {
            navigate(getLearningItemRoute(item));
          }}
        >
          {item.actionLabel}
        </Button>
      </div>
    </div>
  );
};
