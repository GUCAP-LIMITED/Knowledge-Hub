import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  Award,
  BookOpen,
  CheckCircle,
  FolderOpen,
  Lightbulb,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import { Button, RatingStars } from '@shared/ui';
import { cn, sanitizeRichText, useHoverPreview } from '@shared/utils';
import { CertificateModal } from '@features/certificates';
import type { MyLearningItem } from '../domain/entities/my-learning-item';
import type { ContentTypeKey } from '../domain/types';
import { CardDueDate } from './MyLearningCardBadges';
import { CardThumbnail } from './MyLearningCardThumbnail';
import { MyLearningCardPreview } from './MyLearningCardPreview';
import { getLearningItemRoute } from './my-learning-routes';
import styles from './MyLearningCard.module.css';

const TYPE_CONFIG: Record<
  ContentTypeKey,
  {
    readonly label: string;
    readonly icon: LucideIcon;
    readonly fallbackClass?: string | undefined;
    readonly badgeClass?: string | undefined;
  }
> = {
  course: {
    label: 'Course',
    icon: BookOpen,
    fallbackClass: styles.fallbackCourse,
    badgeClass: styles.typeCourse,
  },
  tutorial: {
    label: 'Tutorial',
    icon: Lightbulb,
    fallbackClass: styles.fallbackTutorial,
    badgeClass: styles.typeTutorial,
  },
  resource: {
    label: 'Resource',
    icon: FolderOpen,
    fallbackClass: styles.fallbackResource,
    badgeClass: styles.typeResource,
  },
};

export interface MyLearningCardProps {
  readonly item: MyLearningItem;
  readonly onActionClick?: ((item: MyLearningItem) => void) | undefined;
}

const CardMetadata = ({ item }: { readonly item: MyLearningItem }): ReactElement => {
  const duration =
    item.durationSeconds > 0 ? (
      <>
        <span className={styles.metaDot}>•</span>
        <span>{item.formattedDuration()}</span>
      </>
    ) : null;

  return (
    <div className={styles.metaSection}>
      <div className={styles.metaRow}>
        {item.isCourse() ? (
          <span>
            {item.totalLessons} {item.totalLessons === 1 ? 'lesson' : 'lessons'}
          </span>
        ) : item.isTutorial() ? (
          <>
            <span>1 lesson</span>
            <span className={styles.metaDot}>•</span>
            <span>{item.difficultyName}</span>
          </>
        ) : (
          <span>Document</span>
        )}
        {duration}
      </div>
      <div className={styles.metaRatingRow}>
        <RatingStars rating={item.rating} reviewCount={item.totalReviews} size="sm" />
        <span
          className={styles.metaItem}
          title={`${String(item.helpfulCount)} helpful votes`}
        >
          <ThumbsUp size={13} aria-hidden="true" />
          <span>{item.helpfulCount}</span>
        </span>
      </div>
    </div>
  );
};

interface CardFooterProps {
  readonly item: MyLearningItem;
  readonly targetUrl: string;
  readonly isLink: boolean;
  readonly onActionClick?: ((item: MyLearningItem) => void) | undefined;
  readonly onCertificateClick?: (() => void) | undefined;
}

const CardFooter = ({
  item,
  targetUrl,
  isLink,
  onActionClick,
  onCertificateClick,
}: CardFooterProps): ReactElement => {
  const hasCertificate = item.isCompleted() && item.certificateId !== null;
  const certificateIsPrimary = hasCertificate && !item.isAccessible;

  const certificateButton = hasCertificate ? (
    <Button
      variant="secondary"
      fullWidth
      onClick={() => {
        onCertificateClick?.();
      }}
    >
      <Award size={15} aria-hidden="true" />
      <span>{certificateIsPrimary ? 'View Certificate' : 'Certificate'}</span>
    </Button>
  ) : null;

  return (
    <div className={styles.cardFooter}>
      {item.isCompleted() ? (
        <div className={styles.completedBanner}>
          <CheckCircle size={15} aria-hidden="true" />
          <span>Completed</span>
        </div>
      ) : item.isCourse() || item.progress > 0 ? (
        <div className={styles.progressSection}>
          <div className={styles.progressLabelRow}>
            <span>Progress</span>
            <span>{item.progress}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${String(item.progress)}%` }}
            />
          </div>
        </div>
      ) : null}

      {certificateIsPrimary ? (
        certificateButton
      ) : (
        <div className={styles.cardActions}>
          {isLink ? (
            <Button asChild fullWidth>
              <Link to={targetUrl}>
                <span>{item.actionLabel}</span>
              </Link>
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={() => {
                onActionClick?.(item);
              }}
            >
              <span>{item.actionLabel}</span>
            </Button>
          )}
          {certificateButton}
        </div>
      )}
    </div>
  );
};

const AccessBadge = ({
  item,
}: {
  readonly item: MyLearningItem;
}): ReactElement | null => {
  if (item.isAccessible) {
    return null;
  }

  const isArchived = item.isPublished;

  return (
    <span
      className={cn(
        styles.accessBadge,
        isArchived ? styles.accessArchived : styles.accessRestricted,
      )}
      title={
        isArchived
          ? 'No longer available in your catalog'
          : 'Content is no longer published'
      }
    >
      <Archive size={11} aria-hidden="true" />
      <span>{isArchived ? 'Archived' : 'Restricted'}</span>
    </span>
  );
};

const MyLearningCardFace = ({
  item,
  onActionClick,
}: MyLearningCardProps): ReactElement => {
  const typeConfig = TYPE_CONFIG[item.contentType];
  const TypeIcon = typeConfig.icon;
  const isLink = onActionClick === undefined;
  const targetUrl = getLearningItemRoute(item);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  return (
    <article className={styles.card}>
      <CardThumbnail
        item={item}
        targetUrl={targetUrl}
        isLink={isLink}
        onActionClick={onActionClick}
      />

      <div className={styles.cardBody}>
        <div className={styles.typeRow}>
          <span className={cn(styles.typeBadge, typeConfig.badgeClass)}>
            <TypeIcon size={12} aria-hidden="true" />
            <span>{typeConfig.label}</span>
          </span>
          <AccessBadge item={item} />
          {item.categoryName ? (
            <span className={styles.categoryTag}>• {item.categoryName}</span>
          ) : null}
        </div>

        <h3 className={styles.title} title={item.title}>
          {isLink ? (
            <Link to={targetUrl} className={styles.titleLink}>
              {item.title}
            </Link>
          ) : (
            <button
              type="button"
              className={styles.titleBtn}
              onClick={() => {
                onActionClick(item);
              }}
            >
              {item.title}
            </button>
          )}
        </h3>

        {item.description ? (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.description) }}
          />
        ) : null}

        <CardMetadata item={item} />
        <CardDueDate item={item} />
        <CardFooter
          item={item}
          targetUrl={targetUrl}
          isLink={isLink}
          onActionClick={onActionClick}
          onCertificateClick={
            item.certificateId !== null
              ? () => {
                  setCertificateId(item.certificateId);
                }
              : undefined
          }
        />
      </div>

      {certificateId !== null ? (
        <CertificateModal
          certificateId={certificateId}
          onClose={() => {
            setCertificateId(null);
          }}
        />
      ) : null}
    </article>
  );
};

export const MyLearningCard = (props: MyLearningCardProps): ReactElement => {
  const hover = useHoverPreview();

  return (
    <div
      ref={hover.ref}
      className={styles.cardWrapper}
      onMouseEnter={hover.onMouseEnter}
      onMouseLeave={hover.onMouseLeave}
    >
      <MyLearningCardFace {...props} />
      {hover.side ? <MyLearningCardPreview item={props.item} side={hover.side} /> : null}
    </div>
  );
};
