import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FolderOpen,
  Lightbulb,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge, type StatusTone } from '@shared/ui';
import { cn } from '@shared/utils';
import type { MyLearningItem } from '../domain/entities/my-learning-item';
import type { ContentTypeKey, MyLearningStatusKey } from '../domain/types';
import { CardOriginBadge } from './MyLearningCardBadges';
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

const STATUS_TONES: Record<MyLearningStatusKey, StatusTone> = {
  notStarted: 'neutral',
  inProgress: 'info',
  completed: 'success',
  overdue: 'danger',
  paused: 'warning',
};

export interface CardThumbnailProps {
  readonly item: MyLearningItem;
  readonly targetUrl: string;
  readonly isLink: boolean;
  readonly onActionClick?: ((item: MyLearningItem) => void) | undefined;
}

interface CardThumbnailImageProps {
  readonly src: string;
  readonly alt: string;
  readonly fallback: ReactElement;
}

const CardThumbnailImage = ({
  src,
  alt,
  fallback,
}: CardThumbnailImageProps): ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return fallback;
  }

  return (
    <>
      {!isLoaded ? <div className={styles.thumbSkeleton} aria-hidden="true" /> : null}
      <img
        src={src}
        alt={alt}
        className={cn(
          styles.thumbImage,
          isLoaded ? styles.thumbImageLoaded : styles.thumbImageLoading,
        )}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
        }}
        onError={() => {
          setHasError(true);
        }}
      />
    </>
  );
};

export const CardThumbnail = ({
  item,
  targetUrl,
  isLink,
  onActionClick,
}: CardThumbnailProps): ReactElement => {
  const typeConfig = TYPE_CONFIG[item.contentType];
  const TypeIcon = typeConfig.icon;

  const fallbackContent = (
    <div className={cn(styles.thumbFallback, typeConfig.fallbackClass)}>
      <TypeIcon size={44} aria-hidden="true" />
    </div>
  );

  const thumbContent = (
    <>
      <CardOriginBadge item={item} />
      <div className={styles.badgeTopRight}>
        <StatusBadge tone={STATUS_TONES[item.status]} label={item.statusName} />
      </div>

      {item.thumbnailUrl ? (
        <CardThumbnailImage
          src={item.thumbnailUrl}
          alt={item.title}
          fallback={fallbackContent}
        />
      ) : (
        fallbackContent
      )}

      <div className={styles.thumbOverlay}>
        <div className={styles.playActionCircle}>
          <PlayCircle size={26} aria-hidden="true" />
        </div>
      </div>
    </>
  );

  if (isLink) {
    return (
      <Link
        to={targetUrl}
        className={styles.thumbContainer}
        aria-label={`Open ${item.title}`}
      >
        {thumbContent}
      </Link>
    );
  }

  return (
    <div
      className={styles.thumbContainer}
      role="button"
      tabIndex={0}
      onClick={() => {
        onActionClick?.(item);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onActionClick?.(item);
        }
      }}
    >
      {thumbContent}
    </div>
  );
};
