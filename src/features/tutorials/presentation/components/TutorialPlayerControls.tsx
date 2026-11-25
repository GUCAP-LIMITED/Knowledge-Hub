import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@shared/ui';
import type { TutorialVideo } from '../../domain';

import styles from './TutorialPlaylist.module.css';

export interface TutorialPlayerControlsProps {
  readonly activeVideo: TutorialVideo | null;
  readonly activeIndex: number;
  readonly totalVideos: number;
  readonly isCompleted: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onMarkComplete: () => void;
  readonly isMarkingComplete?: boolean;
}

export const TutorialPlayerControls = ({
  activeVideo,
  activeIndex,
  totalVideos,
  isCompleted,
  onPrevious,
  onNext,
  onMarkComplete,
  isMarkingComplete = false,
}: TutorialPlayerControlsProps): ReactElement | null => {
  if (totalVideos <= 1 && !activeVideo) {
    return null;
  }

  const title = activeVideo
    ? activeVideo.title && activeVideo.title.trim().length > 0
      ? activeVideo.title.trim()
      : activeVideo.originalFileName
    : 'Video Player';

  const canPrevious = activeIndex > 0;
  const canNext = activeIndex < totalVideos - 1;

  return (
    <div className={styles.controlsBar}>
      <div className={styles.controlsInfo}>
        <span className={styles.controlsPartLabel}>
          Part {activeIndex + 1} of {totalVideos}
        </span>
        <span className={styles.controlsVideoTitle} title={title}>
          {title}
        </span>
      </div>

      <div className={styles.controlsButtons}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrevious}
          onClick={onPrevious}
          aria-label="Previous tutorial part"
        >
          <ChevronLeft size={16} aria-hidden="true" style={{ marginRight: '0.2rem' }} />
          Previous
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={onNext}
          aria-label="Next tutorial part"
        >
          Next
          <ChevronRight size={16} aria-hidden="true" style={{ marginLeft: '0.2rem' }} />
        </Button>

        <Button
          type="button"
          variant={isCompleted ? 'secondary' : 'default'}
          size="sm"
          disabled={isCompleted || isMarkingComplete}
          onClick={onMarkComplete}
          aria-label={isCompleted ? 'Part watched' : 'Mark part as watched'}
        >
          <Check size={14} aria-hidden="true" style={{ marginRight: '0.25rem' }} />
          {isCompleted ? 'Watched' : isMarkingComplete ? 'Saving...' : 'Mark Watched'}
        </Button>
      </div>
    </div>
  );
};
