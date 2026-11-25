import { useState, type ReactElement } from 'react';
import {
  type LucideIcon,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  Lock,
  Folder,
  Film,
  FileText,
  CheckSquare,
  BookOpen,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Badge, Button } from '@shared/ui';
import { formatDurationDisplay } from '@features/content';
import type { LessonWithState } from './course-curriculum-utils';
import styles from './CourseDetailPage.module.css';

export interface CourseWatchHeaderProps {
  readonly lesson: LessonWithState;
  readonly sectionTitle?: string | undefined;
  readonly lessonNumber?: number | undefined;
  readonly totalLessons?: number | undefined;
  readonly isEnrolled: boolean;
}

const getLessonKindBadge = (
  kind: LessonWithState['kind'],
): { icon: LucideIcon; label: string } => {
  switch (kind) {
    case 'video':
      return { icon: Film, label: 'Video Lesson' };
    case 'pdf':
      return { icon: FileText, label: 'Document / PDF' };
    case 'quiz':
      return { icon: CheckSquare, label: 'Interactive Quiz' };
    case 'assignment':
      return { icon: BookOpen, label: 'Assignment' };
    case 'link':
      return { icon: Globe, label: 'External Link' };
    default:
      return { icon: BookOpen, label: 'Lesson' };
  }
};

const formatLessonDuration = (durationStr: string, durationSeconds?: number): string => {
  if (durationSeconds !== undefined && durationSeconds > 0) {
    return formatDurationDisplay(durationSeconds);
  }
  return durationStr !== 'N/A' ? durationStr : 'Self-paced';
};

export const CourseWatchHeader = ({
  lesson,
  sectionTitle,
  lessonNumber,
  totalLessons,
  isEnrolled,
}: CourseWatchHeaderProps): ReactElement => {
  const kindInfo = getLessonKindBadge(lesson.kind);
  const durationText = formatLessonDuration(lesson.duration, lesson.durationSeconds);

  return (
    <header className={styles.watchHeader}>
      <div className={styles.watchContextRow}>
        {sectionTitle ? (
          <span className={styles.sectionBadge}>
            <Folder size={14} className={styles.sectionIcon} aria-hidden="true" />
            <span>Section: {sectionTitle}</span>
          </span>
        ) : (
          <span className={styles.sectionBadge}>
            <Film size={14} className={styles.sectionIcon} aria-hidden="true" />
            <span>Curriculum Lesson</span>
          </span>
        )}

        {lessonNumber !== undefined && totalLessons !== undefined && (
          <span className={styles.lessonCounterBadge}>
            Lesson {lessonNumber} of {totalLessons}
          </span>
        )}
      </div>

      <h1 className={styles.watchLessonTitle}>{lesson.title}</h1>

      <div className={styles.watchMetaBadges}>
        <Badge tone="primary" icon={kindInfo.icon}>
          {kindInfo.label}
        </Badge>

        <Badge tone="neutral" icon={Clock}>
          {durationText}
        </Badge>

        {lesson.isPreview ? (
          <Badge tone="success" icon={Eye}>
            Free Preview
          </Badge>
        ) : (
          !isEnrolled && (
            <Badge tone="neutral" icon={Lock}>
              Enrolled Only
            </Badge>
          )
        )}

        {isEnrolled && (
          <Badge
            tone={lesson.completed ? 'success' : 'neutral'}
            icon={lesson.completed ? CheckCircle : undefined}
          >
            {lesson.completed ? 'Completed' : 'In Progress'}
          </Badge>
        )}
      </div>
    </header>
  );
};

export interface ExternalSourceCardProps {
  readonly url: string;
  readonly label?: string | undefined;
}

export const ExternalSourceCard = ({
  url,
  label = 'Video Source',
}: ExternalSourceCardProps): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={styles.externalSourceCard}>
      <div className={styles.externalSourceInfo}>
        <div className={styles.externalSourceTitleRow}>
          <Film size={14} className={styles.externalSourceIcon} aria-hidden="true" />
          <span className={styles.externalSourceProvider}>{label}</span>
        </div>
        <span className={styles.externalSourceUrl} title={url}>
          {url}
        </span>
      </div>
      <div className={styles.externalSourceActions}>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          title="Copy link to clipboard"
        >
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            window.open(url, '_blank', 'noreferrer');
          }}
          title="Open in new window"
        >
          <ExternalLink size={14} aria-hidden="true" />
          <span>Open</span>
        </Button>
      </div>
    </div>
  );
};

export const PreviewEnrollBanner = ({
  onEnroll,
  isEnrolling = false,
}: {
  readonly onEnroll?: (() => void) | undefined;
  readonly isEnrolling?: boolean | undefined;
}): ReactElement => (
  <div className={styles.previewBanner}>
    <div className={styles.previewBannerContent}>
      <div className={styles.previewBannerTitle}>
        <Badge tone="success" size="sm">
          Free Preview
        </Badge>
        <span>Preview Mode</span>
      </div>
      <div className={styles.previewBannerSubtitle}>
        You are watching a free preview lesson. Enroll in this course to track progress,
        access quizzes, and earn your certificate.
      </div>
    </div>
    {onEnroll && (
      <Button onClick={onEnroll} isLoading={isEnrolling} variant="default">
        Enroll in Course
      </Button>
    )}
  </div>
);
