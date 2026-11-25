import { useEffect, useState, type ReactElement } from 'react';
import {
  FileClock,
  BookOpen,
  Lightbulb,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@shared/ui';
import type { UploadDraft, DraftSummary } from './use-upload-draft';
import { type ContentTypeKey, typeLabel } from './upload-content-types';
import styles from './UploadPage.module.css';

export interface DraftBannerProps {
  /** The restored draft metadata, if available. */
  readonly draftInfo?: UploadDraft | null;
  /** Epoch ms the draft was last saved, or null when unknown. */
  readonly savedAt: number | null;
  readonly onResume: () => void;
  readonly onDiscard: () => void;
}

const relativeSaved = (savedAt: number | null, now: number): string | null => {
  if (savedAt === null) {
    return null;
  }
  const minutes = Math.round((now - savedAt) / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${String(minutes)}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${String(hours)}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${String(days)}d ago`;
};

const getDraftIcon = (contentType?: ContentTypeKey | null): LucideIcon => {
  if (contentType === 'course') return BookOpen;
  if (contentType === 'tutorial') return Lightbulb;
  if (contentType === 'resource') return FolderOpen;
  return FileClock;
};

const formatDetailsParts = (summary?: DraftSummary): readonly string[] => {
  if (!summary) return [];
  const parts: string[] = [];
  if (summary.sectionsCount > 0) {
    parts.push(`${String(summary.sectionsCount)} sections`);
  }
  if (summary.lessonsCount > 0) {
    parts.push(`${String(summary.lessonsCount)} lessons`);
  }
  if (summary.audienceCount > 1) {
    parts.push(`${String(summary.audienceCount)} audience groups`);
  }
  return parts;
};

const resolveDraftTitle = (draftInfo?: UploadDraft | null): string => {
  const customTitle = draftInfo?.draftTitle?.trim();
  if (customTitle && customTitle.length > 0) {
    return customTitle;
  }
  const detailsTitle = draftInfo?.details.title.trim();
  if (detailsTitle && detailsTitle.length > 0) {
    return detailsTitle;
  }
  return 'Untitled Draft';
};

/** A calm, premium "resume your draft" banner — icon, hierarchy, and a clear primary action. */
export const DraftBanner = ({
  draftInfo,
  savedAt,
  onResume,
  onDiscard,
}: DraftBannerProps): ReactElement => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 30_000);
    return () => {
      clearInterval(id);
    };
  }, []);

  const saved = relativeSaved(savedAt ?? draftInfo?.savedAt ?? null, now);
  const IconComponent = getDraftIcon(draftInfo?.contentType);
  const typeText = draftInfo?.contentType ? typeLabel(draftInfo.contentType) : null;
  const titleText = resolveDraftTitle(draftInfo);
  const detailsParts = formatDetailsParts(draftInfo?.summary);

  return (
    <div className={styles.draftBanner} role="status">
      <span className={styles.draftIcon}>
        <IconComponent size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className={styles.draftText}>
        <div className={styles.draftHeaderRow}>
          <span className={styles.draftTitle}>
            {typeText !== null ? `${typeText} Draft: ` : 'Draft found: '}
            <span className={styles.draftTitleHighlight}>"{titleText}"</span>
          </span>
          {saved !== null && <span className={styles.draftBadge}>Saved {saved}</span>}
        </div>
        <span className={styles.draftDesc}>
          {detailsParts.length > 0
            ? detailsParts.join(' · ')
            : 'You have an unsaved upload from a previous session.'}
        </span>
      </div>
      <div className={styles.draftActions}>
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
        <Button size="sm" onClick={onResume}>
          Resume draft
        </Button>
      </div>
    </div>
  );
};
