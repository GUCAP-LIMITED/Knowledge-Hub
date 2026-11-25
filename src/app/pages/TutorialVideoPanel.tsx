/* eslint-disable max-lines-per-function, complexity */
import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Award, Check } from 'lucide-react';
import { Alert, Button, HelpfulVoteButton } from '@shared/ui';
import { PlaybackMediaViewer } from '@features/playback';
import { ContentReviewsPanel } from '@features/course-reviews';
import {
  type Tutorial,
  type TutorialVideo,
  useMarkTutorialComplete,
  useMarkTutorialHelpful,
  useMarkVideoComplete,
  useTutorialAutoplay,
  TutorialPlaylistSidebar,
  TutorialPlayerControls,
  ExternalVideoHint,
} from '@features/tutorials';
import styles from './TutorialDetailPage.module.css';

export const TutorialCertificateBanner = ({
  onView,
}: {
  readonly onView?: (() => void) | undefined;
}): ReactElement => (
  <Alert tone="success" title="Tutorial completed!">
    {onView ? (
      <Button type="button" variant="outline" size="sm" onClick={onView}>
        <Award aria-hidden="true" /> View certificate
      </Button>
    ) : null}
  </Alert>
);

const resolveInitialVideo = (videos: readonly TutorialVideo[]): TutorialVideo | null => {
  if (videos.length === 0) return null;
  const firstUncompleted = videos.find((v) => !v.isMediaCompleted);
  return firstUncompleted ?? videos[0] ?? null;
};

export interface TutorialVideoPanelProps {
  readonly tutorial: Tutorial;
  readonly hasCertificate: boolean;
  readonly onViewCertificate?: (() => void) | undefined;
  readonly onEnded: () => void;
}

export const TutorialVideoPanel = ({
  tutorial,
  hasCertificate,
  onViewCertificate,
  onEnded,
}: TutorialVideoPanelProps): ReactElement => {
  const markHelpful = useMarkTutorialHelpful();
  const markVideoComplete = useMarkVideoComplete();
  const markTutorialComplete = useMarkTutorialComplete();

  const videos = tutorial.videos;
  const hasMultipleVideos = videos.length > 1;

  const [activeVideoId, setActiveVideoId] = useState<string | null>(() => {
    const initial = resolveInitialVideo(videos);
    return initial?.id ?? null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
  }, [activeVideoId]);

  useEffect(() => {
    if (activeVideoId === null && videos.length > 0) {
      const initial = resolveInitialVideo(videos);
      setActiveVideoId(initial?.id ?? null);
    }
  }, [tutorial.id, activeVideoId, videos]);

  const activeVideo =
    videos.find((v) => v.id === activeVideoId) ?? resolveInitialVideo(videos);

  const activeIndex = activeVideo
    ? Math.max(
        0,
        videos.findIndex((v) => v.id === activeVideo.id),
      )
    : 0;

  const isCurrentVideoCompleted = Boolean(activeVideo?.isMediaCompleted);

  const nextVideo =
    activeIndex < videos.length - 1 ? (videos[activeIndex + 1] ?? null) : null;

  const handleAdvanceToNext = useCallback((next: TutorialVideo): void => {
    setShouldAutoPlay(true);
    setActiveVideoId(next.id);
  }, []);

  const autoplay = useTutorialAutoplay({
    currentVideo: activeVideo ?? null,
    nextVideo,
    isCurrentVideoCompleted,
    tutorialId: tutorial.id,
    onMarkCompleteAsync: async (input) => {
      await markVideoComplete.mutateAsync(input);
    },
    onAdvanceToNext: handleAdvanceToNext,
  });

  const handleVideoEnded = (): void => {
    if (autoplay.isEnabled && nextVideo) {
      void autoplay.handleVideoEnded();
    } else {
      if (hasMultipleVideos) {
        if (activeVideo && !activeVideo.isMediaCompleted) {
          markVideoComplete.mutate({
            id: tutorial.id,
            mediaAssetId: activeVideo.id,
          });
        }
      }
      onEnded();
    }
  };

  const handleManualMarkComplete = (): void => {
    if (activeVideo && !activeVideo.isMediaCompleted) {
      markVideoComplete.mutate({
        id: tutorial.id,
        mediaAssetId: activeVideo.id,
      });
    }
  };

  const handlePrevious = (): void => {
    autoplay.cancelAutoplay();
    setShouldAutoPlay(false);
    const prev = videos[activeIndex - 1];
    if (prev) {
      setActiveVideoId(prev.id);
    }
  };

  const handleNext = (): void => {
    autoplay.cancelAutoplay();
    setShouldAutoPlay(false);
    const next = videos[activeIndex + 1];
    if (next) {
      setActiveVideoId(next.id);
    }
  };

  const handleSelectVideo = (selected: TutorialVideo): void => {
    autoplay.cancelAutoplay();
    setShouldAutoPlay(false);
    setActiveVideoId(selected.id);
  };

  const mediaAssetId: string | null = activeVideo
    ? activeVideo.externalUrl
      ? null
      : activeVideo.id
    : (tutorial.mediaAssetId ?? null);

  const externalUrl: string | null = activeVideo
    ? (activeVideo.externalUrl ?? null)
    : (tutorial.mediaUrl ?? null);

  const currentTitle = activeVideo
    ? activeVideo.title && activeVideo.title.trim().length > 0
      ? activeVideo.title.trim()
      : activeVideo.originalFileName
    : tutorial.title;

  return (
    <div className={styles.watchContent}>
      {hasMultipleVideos ? (
        <div className={styles.theaterLayout}>
          {externalUrl ? (
            <ExternalVideoHint url={externalUrl} title={currentTitle} />
          ) : mediaAssetId ? (
            <PlaybackMediaViewer
              mediaAssetId={mediaAssetId}
              externalUrl={null}
              kind="video"
              title={currentTitle}
              autoPlay={shouldAutoPlay}
              onEnded={handleVideoEnded}
              onPlayingChange={setIsPlaying}
            />
          ) : null}

          <div className={styles.belowPlayer}>
            <div className={styles.playerColumn}>
              <TutorialPlayerControls
                activeVideo={activeVideo}
                activeIndex={activeIndex}
                totalVideos={videos.length}
                isCompleted={isCurrentVideoCompleted}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onMarkComplete={handleManualMarkComplete}
                isMarkingComplete={markVideoComplete.isPending}
              />

              {hasCertificate ? (
                <TutorialCertificateBanner onView={onViewCertificate} />
              ) : null}

              <div className={styles.helpfulRow}>
                <HelpfulVoteButton
                  isHelpful={tutorial.isHelpful}
                  helpfulCount={tutorial.helpfulCount}
                  isPending={markHelpful.isPending}
                  onVote={() => {
                    if (!markHelpful.isPending) {
                      markHelpful.mutate(tutorial.id);
                    }
                  }}
                />
              </div>

              <ContentReviewsPanel
                contentId={tutorial.id}
                contentName={tutorial.title}
                heading="Ratings & reviews"
                canReview={tutorial.isCompleted()}
              />
            </div>

            <aside className={styles.playlistColumn}>
              <TutorialPlaylistSidebar
                videos={videos}
                activeVideoId={activeVideo?.id ?? null}
                isPlaying={isPlaying}
                onSelectVideo={handleSelectVideo}
                progressPercent={tutorial.progressPercent}
                autoplayEnabled={autoplay.isEnabled}
                onToggleAutoplay={autoplay.setIsEnabled}
                autoplayCountdown={autoplay.isCounting ? autoplay.countdown : null}
                autoplayNextVideoId={nextVideo?.id ?? null}
                isAutoplaySaving={autoplay.isSaving}
                onPlayNextNow={autoplay.playNow}
                onCancelAutoplay={autoplay.cancelAutoplay}
              />
            </aside>
          </div>
        </div>
      ) : (
        <div className={styles.theaterLayoutSingle}>
          {externalUrl ? (
            <ExternalVideoHint url={externalUrl} title={currentTitle} />
          ) : mediaAssetId ? (
            <PlaybackMediaViewer
              mediaAssetId={mediaAssetId}
              externalUrl={null}
              kind="video"
              title={currentTitle}
              onEnded={handleVideoEnded}
              onPlayingChange={setIsPlaying}
            />
          ) : null}

          <div className={styles.singleControlsRow}>
            <Button
              type="button"
              variant={tutorial.isCompleted() ? 'secondary' : 'default'}
              size="sm"
              disabled={tutorial.isCompleted() || markTutorialComplete.isPending}
              onClick={() => {
                onEnded();
              }}
              aria-label={
                tutorial.isCompleted()
                  ? 'Tutorial completed'
                  : tutorial.isQuizRequired
                    ? 'Mark video as watched'
                    : 'Mark tutorial as completed'
              }
            >
              <Check size={14} aria-hidden="true" style={{ marginRight: '0.25rem' }} />
              {tutorial.isCompleted()
                ? 'Completed'
                : markTutorialComplete.isPending
                  ? 'Saving...'
                  : tutorial.isQuizRequired
                    ? 'Mark Watched'
                    : 'Mark as completed'}
            </Button>
          </div>

          {hasCertificate ? (
            <TutorialCertificateBanner onView={onViewCertificate} />
          ) : null}

          <div className={styles.helpfulRow}>
            <HelpfulVoteButton
              isHelpful={tutorial.isHelpful}
              helpfulCount={tutorial.helpfulCount}
              isPending={markHelpful.isPending}
              onVote={() => {
                if (!markHelpful.isPending) {
                  markHelpful.mutate(tutorial.id);
                }
              }}
            />
          </div>

          <ContentReviewsPanel
            contentId={tutorial.id}
            contentName={tutorial.title}
            heading="Ratings & reviews"
            canReview={tutorial.isCompleted()}
          />
        </div>
      )}
    </div>
  );
};
