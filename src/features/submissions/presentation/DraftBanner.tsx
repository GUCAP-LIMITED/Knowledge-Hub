import type { ReactElement } from 'react';
import { FileClock } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from './UploadPage.module.css';

export interface DraftBannerProps {
  /** Epoch ms the draft was last saved, or null when unknown. */
  readonly savedAt: number | null;
  readonly onResume: () => void;
  readonly onDiscard: () => void;
}

const relativeSaved = (savedAt: number | null): string | null => {
  if (savedAt === null) {
    return null;
  }
  const minutes = Math.round((Date.now() - savedAt) / 60_000);
  if (minutes < 1) {
    return 'Last saved just now';
  }
  if (minutes < 60) {
    return `Last saved ${String(minutes)} minute${minutes === 1 ? '' : 's'} ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `Last saved ${String(hours)} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.round(hours / 24);
  return `Last saved ${String(days)} day${days === 1 ? '' : 's'} ago`;
};

/** A calm, premium "resume your draft" banner — icon, hierarchy, and a clear primary action. */
export const DraftBanner = ({
  savedAt,
  onResume,
  onDiscard,
}: DraftBannerProps): ReactElement => {
  const saved = relativeSaved(savedAt);
  return (
    <div className={styles.draftBanner} role="status">
      <span className={styles.draftIcon}>
        <FileClock size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className={styles.draftText}>
        <span className={styles.draftTitle}>Draft found</span>
        <span className={styles.draftDesc}>
          You have an unsaved upload from a previous session.
          {saved !== null ? <span className={styles.draftMeta}> · {saved}</span> : null}
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
