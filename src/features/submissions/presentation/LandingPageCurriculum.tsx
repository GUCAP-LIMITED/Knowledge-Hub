import type { ReactElement } from 'react';
import { Film, HelpCircle, FileText } from 'lucide-react';
import { LESSON_KIND } from '@features/content';
import { cn } from '@shared/utils';
import type { LandingPageSection } from './LandingPagePreview';
import styles from './LandingPagePreview.module.css';

interface CurriculumLessonItemProps {
  readonly lesson: LandingPageSection['lessons'][number];
  readonly isLast: boolean;
}

const renderLessonIcon = (kind: number): ReactElement => {
  if (kind === LESSON_KIND.video || kind === 0) {
    return <Film size={15} className={styles.videoIcon} />;
  }
  if (kind === LESSON_KIND.quiz || kind === 10) {
    return <HelpCircle size={15} className={styles.quizIcon} />;
  }
  return <FileText size={15} className={styles.docIcon} />;
};

const CurriculumLessonItem = ({
  lesson,
  isLast,
}: CurriculumLessonItemProps): ReactElement => (
  <div className={cn(styles.lessonRow, !isLast && styles.lessonRowBorder)}>
    <span className={styles.lessonTitleWrapper}>
      {renderLessonIcon(lesson.kind)}
      {lesson.title}
    </span>
    {lesson.isPreview ? <span className={styles.previewBadge}>Free Preview</span> : null}
  </div>
);

interface CurriculumSectionCardProps {
  readonly section: LandingPageSection;
  readonly index: number;
}

const CurriculumSectionCard = ({
  section,
  index,
}: CurriculumSectionCardProps): ReactElement => (
  <div className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <span>
        Section {String(index + 1)}: {section.title}
      </span>
      <span className={styles.lessonCount}>{String(section.lessons.length)} lessons</span>
    </div>
    <div className={styles.lessonsContainer}>
      {section.lessons.map((lesson, lIdx) => (
        <CurriculumLessonItem
          key={lesson.id}
          lesson={lesson}
          isLast={lIdx === section.lessons.length - 1}
        />
      ))}
    </div>
  </div>
);

export interface LandingPageCurriculumProps {
  readonly sections: readonly LandingPageSection[];
  readonly totalLessons: number;
}

export const LandingPageCurriculum = ({
  sections,
  totalLessons,
}: LandingPageCurriculumProps): ReactElement => (
  <div>
    <div className={styles.curriculumHeader}>
      <h3 className={styles.sectionTitle}>Course Curriculum</h3>
      <span className={styles.curriculumMeta}>
        {String(sections.length)} Sections · {String(totalLessons)} Lessons
      </span>
    </div>

    <div className={styles.curriculumList}>
      {sections.map((section, sIdx) => (
        <CurriculumSectionCard key={section.id} section={section} index={sIdx} />
      ))}
    </div>
  </div>
);
