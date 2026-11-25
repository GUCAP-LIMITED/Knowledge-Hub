import type { ReactElement } from 'react';
import { LandingPageHeroHeader } from './LandingPageHeroHeader';
import { LandingPageCurriculum } from './LandingPageCurriculum';
import styles from './LandingPagePreview.module.css';

export interface LandingPageSection {
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly {
    readonly id: string;
    readonly title: string;
    readonly kind: number;
    readonly isPreview?: boolean | undefined;
  }[];
}

export interface LandingPagePreviewProps {
  readonly title: string;
  readonly subtitle?: string | null | undefined;
  readonly description?: string | null | undefined;
  readonly categoryName?: string | undefined;
  readonly difficultyLabel: string;
  readonly durationText: string;
  readonly sections: readonly LandingPageSection[];
  readonly author: string;
  readonly contentType: string;
  readonly language?: string | null | undefined;
}

export const LandingPagePreview = ({
  title,
  subtitle,
  description,
  categoryName,
  difficultyLabel,
  durationText,
  sections,
  author,
  contentType,
  language,
}: LandingPagePreviewProps): ReactElement => {
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className={styles.container}>
      <LandingPageHeroHeader
        title={title}
        subtitle={subtitle}
        categoryName={categoryName}
        difficultyLabel={difficultyLabel}
        durationText={durationText}
        sectionsCount={sections.length}
        totalLessons={totalLessons}
        author={author}
        contentType={contentType}
        language={language}
      />

      <div className={styles.contentBody}>
        <div>
          <h3 className={styles.sectionTitle}>About This {contentType}</h3>
          <p className={styles.description}>
            {description ?? 'No description provided.'}
          </p>
        </div>

        {sections.length > 0 ? (
          <LandingPageCurriculum sections={sections} totalLessons={totalLessons} />
        ) : null}
      </div>
    </div>
  );
};
