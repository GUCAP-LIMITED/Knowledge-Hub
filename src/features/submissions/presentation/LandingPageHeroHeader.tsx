import type { ReactElement } from 'react';
import { BookOpen, Clock, Globe, PlayCircle } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from './LandingPagePreview.module.css';

export interface LandingPageHeroHeaderProps {
  readonly title: string;
  readonly subtitle?: string | null | undefined;
  readonly categoryName?: string | undefined;
  readonly difficultyLabel: string;
  readonly durationText: string;
  readonly sectionsCount: number;
  readonly totalLessons: number;
  readonly author: string;
  readonly contentType: string;
  readonly language?: string | null | undefined;
}

export const LandingPageHeroHeader = ({
  title,
  subtitle,
  categoryName,
  difficultyLabel,
  durationText,
  sectionsCount,
  totalLessons,
  author,
  contentType,
  language,
}: LandingPageHeroHeaderProps): ReactElement => (
  <div className={styles.hero}>
    <div className={styles.heroBadges}>
      <span className={styles.typeBadge}>{contentType}</span>
      {categoryName ? <span className={styles.categoryBadge}>{categoryName}</span> : null}
      <span className={styles.difficultyBadge}>{difficultyLabel}</span>
    </div>

    <h1 className={styles.heroTitle}>{title ? title : 'Untitled Content'}</h1>

    {subtitle ? <p className={styles.heroSubtitle}>{subtitle}</p> : null}

    <div className={styles.heroMeta}>
      <span>
        Created by <strong>{author}</strong>
      </span>
      <span>•</span>
      <span className={styles.metaItem}>
        <Clock size={14} /> {durationText}
      </span>
      {totalLessons > 0 ? (
        <>
          <span>•</span>
          <span className={styles.metaItem}>
            <BookOpen size={14} /> {String(sectionsCount)} sections ·{' '}
            {String(totalLessons)} lessons
          </span>
        </>
      ) : null}
      <span>•</span>
      <span className={styles.metaItem}>
        <Globe size={14} /> {language ?? 'English'}
      </span>
    </div>

    <div className={styles.enrollActions}>
      <Button disabled>
        <PlayCircle aria-hidden="true" /> Enroll in {contentType} (Learner View)
      </Button>
    </div>
  </div>
);
