import { Fragment, type ReactElement } from 'react';
import { Check, Play, Pause } from 'lucide-react';
import { Badge, Switch, Spinner } from '@shared/ui';
import { cn } from '@shared/utils';
import type { TutorialVideo } from '../../domain';
import { formatPlaylistDuration } from '../tutorial-video-utils';
import { AutoplayTransitionCard } from './AutoplayTransitionCard';
import styles from './TutorialPlaylist.module.css';

export interface TutorialPlaylistSidebarProps {
  readonly videos: readonly TutorialVideo[];
  readonly activeVideoId: string | null;
  readonly isPlaying?: boolean;
  readonly onSelectVideo: (video: TutorialVideo) => void;
  readonly progressPercent?: number;
  readonly autoplayEnabled?: boolean;
  readonly onToggleAutoplay?: ((enabled: boolean) => void) | undefined;
  readonly autoplayCountdown?: number | null | undefined;
  readonly autoplayNextVideoId?: string | null | undefined;
  readonly isAutoplaySaving?: boolean | undefined;
  readonly onPlayNextNow?: (() => void) | undefined;
  readonly onCancelAutoplay?: (() => void) | undefined;
}

const TutorialEqualizerIcon = (): ReactElement => (
  <span className={styles.equalizer} aria-hidden="true" title="Playing">
    <span className={styles.equalizerBar} />
    <span className={styles.equalizerBar} />
    <span className={styles.equalizerBar} />
  </span>
);

interface TutorialPlaylistItemProps {
  readonly video: TutorialVideo;
  readonly index: number;
  readonly isActive: boolean;
  readonly isPlaying?: boolean;
  readonly isCompleted: boolean;
  readonly isSaving?: boolean;
  readonly onSelect: () => void;
}

const PlaylistItemBadge = ({
  isActive,
  isCompleted,
  index,
}: {
  readonly isActive: boolean;
  readonly isCompleted: boolean;
  readonly index: number;
}): ReactElement => {
  if (isCompleted) {
    return (
      <span
        className={cn(
          styles.indexBadge,
          styles.indexBadgeCompleted,
          isActive && styles.indexBadgeActiveCompleted,
        )}
      >
        <Check size={12} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className={cn(styles.indexBadge, isActive && styles.indexBadgeActive)}>
      #{String(index + 1)}
    </span>
  );
};

const PlaylistItemStatus = ({
  isActive,
  isPlaying = false,
  isCompleted,
  isSaving = false,
}: {
  readonly isActive: boolean;
  readonly isPlaying?: boolean;
  readonly isCompleted: boolean;
  readonly isSaving?: boolean;
}): ReactElement => {
  if (isActive) {
    if (isSaving) {
      return (
        <Badge tone="neutral" size="sm">
          <Spinner size="sm" label="Saving progress" />
          <span style={{ marginLeft: '0.25rem' }}>Saving...</span>
        </Badge>
      );
    }

    if (isPlaying) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <TutorialEqualizerIcon />
          <Badge tone="primary" size="sm">
            Playing
          </Badge>
        </span>
      );
    }

    return (
      <Badge tone="neutral" size="sm" icon={Pause}>
        Paused
      </Badge>
    );
  }

  if (isCompleted) {
    return (
      <Badge tone="success" size="sm">
        <Check size={11} style={{ marginRight: '0.2rem' }} /> Watched
      </Badge>
    );
  }

  return <Play size={14} style={{ color: 'var(--color-text-subtle)' }} />;
};

const TutorialPlaylistItem = ({
  video,
  index,
  isActive,
  isPlaying = false,
  isCompleted,
  isSaving = false,
  onSelect,
}: TutorialPlaylistItemProps): ReactElement => {
  const title =
    video.title && video.title.trim().length > 0
      ? video.title.trim()
      : video.originalFileName;
  const durationStr = formatPlaylistDuration(video.durationSeconds);

  return (
    <button
      type="button"
      className={cn(styles.videoItem, isActive && styles.videoItemActive)}
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className={styles.itemLeft}>
        <PlaylistItemBadge isActive={isActive} isCompleted={isCompleted} index={index} />
        <div className={styles.itemMeta}>
          <span className={cn(styles.itemTitle, isActive && styles.itemTitleActive)}>
            {title}
          </span>
          <span className={styles.itemDuration}>{durationStr || 'Video Part'}</span>
        </div>
      </div>

      <div className={styles.itemRight}>
        <PlaylistItemStatus
          isActive={isActive}
          isPlaying={isPlaying}
          isCompleted={isCompleted}
          isSaving={isSaving}
        />
      </div>
    </button>
  );
};

const PlaylistHeader = ({
  completedCount,
  totalCount,
  percent,
  autoplayEnabled,
  onToggleAutoplay,
}: {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly percent: number;
  readonly autoplayEnabled?: boolean;
  readonly onToggleAutoplay?: ((enabled: boolean) => void) | undefined;
}): ReactElement => (
  <div className={styles.header}>
    <div className={styles.headerTop}>
      <div className={styles.headerTitleGroup}>
        <h3 className={styles.headerTitle}>Tutorial Playlist</h3>
        <span className={styles.progressStats}>
          {completedCount} of {totalCount} completed · {String(percent)}%
        </span>
      </div>

      {onToggleAutoplay ? (
        <div className={styles.autoplayRow}>
          <span className={styles.autoplayLabel}>Autoplay</span>
          <Switch
            checked={autoplayEnabled ?? true}
            onChange={onToggleAutoplay}
            size="sm"
            label="Toggle autoplay next video"
          />
        </div>
      ) : null}
    </div>
    <div
      className={styles.progressBarContainer}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tutorial playlist completion progress"
    >
      <div className={styles.progressBarFill} style={{ width: `${String(percent)}%` }} />
    </div>
  </div>
);

export const TutorialPlaylistSidebar = ({
  videos,
  activeVideoId,
  isPlaying = false,
  onSelectVideo,
  progressPercent,
  autoplayEnabled = true,
  onToggleAutoplay,
  autoplayCountdown,
  autoplayNextVideoId,
  isAutoplaySaving = false,
  onPlayNextNow,
  onCancelAutoplay,
}: TutorialPlaylistSidebarProps): ReactElement => {
  const completedCount = videos.filter((v) => v.isMediaCompleted).length;
  const totalCount = videos.length;
  const percent =
    progressPercent ??
    (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  return (
    <div className={styles.sidebarContainer}>
      <PlaylistHeader
        completedCount={completedCount}
        totalCount={totalCount}
        percent={percent}
        autoplayEnabled={autoplayEnabled}
        onToggleAutoplay={onToggleAutoplay}
      />

      <div className={styles.videoList} role="list" aria-label="Tutorial playlist items">
        {videos.map((video, index) => {
          const isNextForAutoplay =
            autoplayNextVideoId === video.id &&
            autoplayCountdown !== null &&
            autoplayCountdown !== undefined &&
            autoplayCountdown > 0;

          return (
            <Fragment key={video.id}>
              {isNextForAutoplay ? (
                <AutoplayTransitionCard
                  countdown={autoplayCountdown}
                  nextVideoTitle={
                    video.title && video.title.trim().length > 0
                      ? video.title.trim()
                      : video.originalFileName
                  }
                  onPlayNow={onPlayNextNow}
                  onCancel={onCancelAutoplay}
                />
              ) : null}
              <TutorialPlaylistItem
                video={video}
                index={index}
                isActive={video.id === activeVideoId}
                isPlaying={video.id === activeVideoId && isPlaying}
                isCompleted={Boolean(video.isMediaCompleted)}
                isSaving={video.id === activeVideoId && isAutoplaySaving}
                onSelect={() => {
                  onSelectVideo(video);
                }}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
