/* eslint-disable max-lines, max-lines-per-function, complexity, @typescript-eslint/explicit-function-return-type, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-confusing-void-expression, @typescript-eslint/prefer-optional-chain, @typescript-eslint/switch-exhaustiveness-check */
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Settings,
  PictureInPicture,
  Check,
} from 'lucide-react';
import styles from './VideoPlayer.module.css';

export interface VideoQualityOption {
  readonly index: number;
  readonly height: number;
  readonly bitrate: number;
  readonly resolutionLabel: string;
  readonly bitrateLabel: string;
}

export interface VideoPlayerProps {
  readonly src: string;
  readonly title?: string | undefined;
  readonly poster?: string | undefined;
  readonly autoPlay?: boolean | undefined;
  readonly className?: string | undefined;
  readonly onEnded?: (() => void) | undefined;
  readonly onPlayingChange?: ((isPlaying: boolean) => void) | undefined;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatBitrate = (bitrate: number): string => {
  if (!bitrate || bitrate <= 0) return '';
  if (bitrate >= 1000000) {
    const mbps = (bitrate / 1000000).toFixed(1);
    return `${mbps.replace(/\.0$/, '')} Mbps`;
  }
  const kbps = Math.round(bitrate / 1000);
  return `${kbps} kbps`;
};

const getResolutionLabel = (height: number): string => {
  if (height >= 2160) return '4K UHD';
  if (height >= 1440) return '1440p QHD';
  if (height >= 1080) return '1080p HD';
  if (height >= 720) return '720p HD';
  if (height >= 480) return '480p SD';
  if (height >= 360) return '360p SD';
  if (height > 0) return `${height}p`;
  return 'HD';
};

const normalizeStreamUrl = (url: string): string => {
  if (!url) return url;
  const trimmed = url.trim();

  // 1. Bare 32-character Cloudflare Stream UID
  if (/^[a-fA-F0-9]{32}$/.test(trimmed)) {
    return `https://videodelivery.net/${trimmed}/manifest/video.m3u8`;
  }

  // 2. Cloudflare Stream URL missing manifest endpoint
  if (
    (trimmed.includes('videodelivery.net') || trimmed.includes('cloudflarestream.com')) &&
    !trimmed.includes('/manifest/video.m3u8')
  ) {
    const clean = trimmed.replace(/\/watch\//, '/').replace(/\/$/, '');
    return `${clean}/manifest/video.m3u8`;
  }

  return trimmed;
};

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const VideoPlayer = ({
  src,
  title,
  poster,
  autoPlay = false,
  className,
  onEnded,
  onPlayingChange,
}: VideoPlayerProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isDraggingRef = useRef(false);
  const onPlayingChangeRef = useRef(onPlayingChange);
  onPlayingChangeRef.current = onPlayingChange;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Menus
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Quality & HLS state
  const [qualities, setQualities] = useState<VideoQualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = Auto
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
  const [activeBitrate, setActiveBitrate] = useState<number | null>(null);
  const [nativeResolution, setNativeResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const lastBufferUpdateRef = useRef<number>(0);
  const bufferedRef = useRef<number>(0);
  const lastProgressRef = useRef<{ time: number; timestamp: number }>({
    time: 0,
    timestamp: Date.now(),
  });

  // Helper to compute exact buffered length and determine whether playback is genuinely starved
  const updateBufferState = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    let curBuf = 0;
    const ct = video.currentTime;
    const bufRanges = video.buffered;

    // Find the buffered range that encompasses the current playhead
    for (let i = 0; i < bufRanges.length; i++) {
      if (bufRanges.start(i) <= ct + 0.5 && ct <= bufRanges.end(i)) {
        curBuf = Math.max(curBuf, bufRanges.end(i));
      }
    }

    // If playhead is right at start and hasn't crossed start(0) yet
    if (curBuf === 0 && bufRanges.length > 0 && ct <= bufRanges.start(0) + 0.5) {
      curBuf = bufRanges.end(0);
    }

    // Only trigger React state update if buffer changed by >= 0.3s or reached duration
    if (Math.abs(curBuf - bufferedRef.current) >= 0.3 || curBuf >= video.duration) {
      bufferedRef.current = curBuf;
      setBuffered(curBuf);
    }

    // If there is > 0.4s buffered ahead or video is paused, dismiss buffering indicator
    const bufferedAhead = curBuf - ct;
    if (bufferedAhead > 0.4 || video.paused || video.ended) {
      setIsBuffering(false);
    }
  }, []);

  const resolvedUrl = useMemo(() => normalizeStreamUrl(src), [src]);
  const isHls = useMemo(
    () =>
      resolvedUrl.includes('.m3u8') ||
      resolvedUrl.includes('cloudflarestream.com') ||
      resolvedUrl.includes('videodelivery.net'),
    [resolvedUrl],
  );

  // Initialize HLS for adaptive streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setQualities([]);
    setSelectedQuality(-1);
    setActiveHeight(null);
    setActiveBitrate(null);
    setNativeResolution(null);
    setIsBuffering(false);
    setIsPlaying(false);
    onPlayingChangeRef.current?.(false);
    bufferedRef.current = 0;
    setBuffered(0);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        autoStartLoad: true,
        lowLatencyMode: false,
        maxBufferLength: 20, // Maintain reasonable 20s advance buffer
        maxMaxBufferLength: 40,
        backBufferLength: 30,
        startFragPrefetch: true,
        capLevelToPlayerSize: false,
      });
      hlsRef.current = hls;

      hls.attachMedia(video);
      hls.loadSource(resolvedUrl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const parsedLevels: VideoQualityOption[] = hls.levels.map((level, idx) => ({
          index: idx,
          height: level.height,
          bitrate: level.bitrate,
          resolutionLabel:
            level.height > 0
              ? `${level.height}p${level.height >= 720 ? ' HD' : ''}`
              : 'Original',
          bitrateLabel: formatBitrate(level.bitrate),
        }));

        // Sort descending: highest bitrate/height first
        parsedLevels.sort((a, b) => b.bitrate - a.bitrate || b.height - a.height);
        setQualities(parsedLevels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const currentLevel = hls.levels[data.level];
        if (currentLevel) {
          setActiveHeight(currentLevel.height);
          setActiveBitrate(currentLevel.bitrate);
        }
      });

      // Robust buffer stall & error recovery
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        } else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          // Show circle loading indicator while Hls fills buffer
          setIsBuffering(true);
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [resolvedUrl, isHls]);

  // Sync state with HTML video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      onPlayingChangeRef.current?.(true);
    };
    const onPause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      onPlayingChangeRef.current?.(false);
    };
    const onTimeUpdate = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(video.currentTime);
      }
      setIsBuffering(false);
      updateBufferState();
    };
    const onProgress = () => {
      const now = Date.now();
      if (now - lastBufferUpdateRef.current > 400) {
        lastBufferUpdateRef.current = now;
        updateBufferState();
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (video.videoWidth && video.videoHeight) {
        setNativeResolution({ width: video.videoWidth, height: video.videoHeight });
      }
      setIsBuffering(false);
      updateBufferState();
    };
    const onWaiting = () => {
      // Only set buffering if readyState is actually starved (< 3)
      if (video.readyState < 3 && !video.paused) {
        setIsBuffering(true);
      }
    };
    const onCanPlay = () => setIsBuffering(false);
    const onCanPlayThrough = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onSeeked = () => setIsBuffering(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      onPlayingChangeRef.current?.(false);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [updateBufferState]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Playhead stall watchdog: monitors currentTime progression while isPlaying is active
  useEffect(() => {
    if (!isPlaying) return;

    lastProgressRef.current = {
      time: videoRef.current?.currentTime ?? 0,
      timestamp: Date.now(),
    };

    const interval = window.setInterval(() => {
      const video = videoRef.current;
      if (
        !video ||
        video.paused ||
        video.ended ||
        video.seeking ||
        isDraggingRef.current
      ) {
        lastProgressRef.current = {
          time: video?.currentTime ?? 0,
          timestamp: Date.now(),
        };
        return;
      }

      const now = Date.now();
      const advanced = Math.abs(video.currentTime - lastProgressRef.current.time) > 0.05;

      if (advanced) {
        lastProgressRef.current = { time: video.currentTime, timestamp: now };
        setIsBuffering(false);
      } else if (now - lastProgressRef.current.timestamp > 3000) {
        // Playhead has stalled for >3s while playing
        if (
          !video.muted &&
          (video.readyState >= 2 || bufferedRef.current > video.currentTime)
        ) {
          // Chromium audio renderer clock stall — muting releases the media clock
          video.muted = true;
          setIsMuted(true);
          lastProgressRef.current = { time: video.currentTime, timestamp: now };
        } else {
          setIsBuffering(true);
        }
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPlaying]);

  // Controls auto-hide timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !isBuffering) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isBuffering) {
      setShowControls(false);
      setShowSpeedMenu(false);
      setShowQualityMenu(false);
    }
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => {
        // Fallback: If unmuted playback is blocked or fails on audio output device, retry muted
        if (!video.muted) {
          video.muted = true;
          setIsMuted(true);
          void video.play().catch(() => {
            // Playback couldn't be started
          });
        }
      });
    } else {
      video.pause();
    }
  }, []);

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration || 0, video.currentTime + seconds),
    );
  };

  // Smooth scrubber interaction (click & drag)
  const seekToPosition = (clientX: number) => {
    const timeline = timelineRef.current;
    const video = videoRef.current;
    if (!timeline || !video || !duration) return;

    const rect = timeline.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = pos * duration;
    video.currentTime = target;
    setCurrentTime(target);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    timelineRef.current?.setPointerCapture(e.pointerId);
    seekToPosition(e.clientX);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      seekToPosition(e.clientX);
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      timelineRef.current?.releasePointerCapture(e.pointerId);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const handleRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const handleQualityChange = useCallback((qualityIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIndex;
      setSelectedQuality(qualityIndex);
      if (qualityIndex !== -1) {
        const lvl = hlsRef.current.levels[qualityIndex];
        if (lvl) {
          setActiveHeight(lvl.height);
          setActiveBitrate(lvl.bitrate);
        }
      }
    }
    setShowQualityMenu(false);
  }, []);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      void container.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const togglePiP = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      void document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      void video.requestPictureInPicture();
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowLeft' || e.key === 'j') {
      e.preventDefault();
      seekRelative(-5);
    } else if (e.key === 'ArrowRight' || e.key === 'l') {
      e.preventDefault();
      seekRelative(5);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleVolumeChange(Math.min(1, volume + 0.1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleVolumeChange(Math.max(0, volume - 0.1));
    } else if (e.key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'm') {
      e.preventDefault();
      toggleMute();
    }
  };

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  // Selected or active bitrate text
  const currentQualityButtonText = (): string => {
    if (qualities.length > 0) {
      if (selectedQuality === -1) {
        if (activeHeight && activeBitrate) {
          return `Auto (${activeHeight}p • ${formatBitrate(activeBitrate)})`;
        }
        if (activeHeight) {
          return `Auto (${activeHeight}p)`;
        }
        return 'Auto';
      }
      const matched = qualities.find((q) => q.index === selectedQuality);
      if (matched) {
        return `${matched.resolutionLabel}${matched.bitrateLabel ? ` (${matched.bitrateLabel})` : ''}`;
      }
      return activeHeight ? `${activeHeight}p` : 'Quality';
    }

    if (nativeResolution) {
      return getResolutionLabel(nativeResolution.height);
    }
    return 'Quality';
  };

  const shouldShowSpinner = isBuffering && isPlaying;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`${styles.playerContainer} ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      aria-label={title ? `Video Player: ${title}` : 'Video Player'}
    >
      <video
        ref={videoRef}
        src={isHls ? undefined : resolvedUrl}
        poster={poster}
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
        className={styles.videoElement}
        onClick={togglePlay}
        onEnded={() => {
          setIsPlaying(false);
          onPlayingChangeRef.current?.(false);
          onEnded?.();
        }}
      >
        <track kind="captions" />
      </video>

      {/* Center Action Overlay */}
      {shouldShowSpinner ? (
        <div className={styles.centerOverlay}>
          <div className={styles.bufferingSpinner} />
        </div>
      ) : !isPlaying ? (
        <div className={styles.centerOverlay}>
          <button
            type="button"
            className={styles.centerPlayBtn}
            onClick={togglePlay}
            aria-label="Play video"
          >
            <Play size={28} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      ) : null}

      {/* Controls Overlay */}
      <div
        className={`${styles.controlsOverlay} ${
          !showControls && isPlaying ? styles.controlsOverlayHidden : ''
        }`}
      >
        {/* Timeline Scrubber */}
        <div
          ref={timelineRef}
          className={styles.timelineTrack}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className={styles.bufferBar} style={{ width: `${bufferedPercent}%` }} />
          <div className={styles.playedBar} style={{ width: `${playedPercent}%` }} />
          <div className={styles.scrubberThumb} style={{ left: `${playedPercent}%` }} />
        </div>

        {/* Controls Bar */}
        <div className={styles.controlsRow}>
          {/* Left: Play/Pause, Replay 10, Fwd 10, Volume, Time */}
          <div className={styles.leftControls}>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              className={styles.controlBtn}
              onClick={() => seekRelative(-10)}
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              className={styles.controlBtn}
              onClick={() => seekRelative(10)}
              aria-label="Fast forward 10 seconds"
            >
              <RotateCw size={16} />
            </button>

            <div className={styles.volumeGroup}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                className={styles.volumeSlider}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                aria-label="Volume"
              />
            </div>

            <span className={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Quality, Speed, PiP, Fullscreen */}
          <div className={styles.rightControls}>
            {/* Video Quality Menu */}
            <div className={styles.speedMenu}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                aria-label="Video Quality Settings"
              >
                <Settings size={15} />
                <span style={{ fontSize: '0.75rem', marginLeft: '3px', fontWeight: 600 }}>
                  {currentQualityButtonText()}
                </span>
              </button>

              {showQualityMenu && (
                <div className={styles.menuDropdown} style={{ minWidth: '170px' }}>
                  {qualities.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className={`${styles.menuOption} ${
                          selectedQuality === -1 ? styles.menuOptionActive : ''
                        }`}
                        onClick={() => handleQualityChange(-1)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>Auto (Adaptive)</span>
                          {activeBitrate && (
                            <span
                              className={styles.bitrateText}
                              style={{ marginLeft: 0 }}
                            >
                              {activeHeight}p • {formatBitrate(activeBitrate)}
                            </span>
                          )}
                        </div>
                        {selectedQuality === -1 && <Check size={14} />}
                      </button>

                      {qualities.map((q) => (
                        <button
                          key={q.index}
                          type="button"
                          className={`${styles.menuOption} ${
                            selectedQuality === q.index ? styles.menuOptionActive : ''
                          }`}
                          onClick={() => handleQualityChange(q.index)}
                        >
                          <span>{q.resolutionLabel}</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {q.bitrateLabel && (
                              <span className={styles.bitrateText}>{q.bitrateLabel}</span>
                            )}
                            {selectedQuality === q.index && (
                              <Check size={14} style={{ marginLeft: '4px' }} />
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.menuOption} ${styles.menuOptionActive}`}
                      onClick={() => setShowQualityMenu(false)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>
                          {getResolutionLabel(nativeResolution?.height ?? 1080)}
                        </span>
                        <span className={styles.bitrateText} style={{ marginLeft: 0 }}>
                          {nativeResolution
                            ? `${nativeResolution.width} × ${nativeResolution.height} • Source`
                            : 'Source Stream'}
                        </span>
                      </div>
                      <Check size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Playback Speed Menu */}
            <div className={styles.speedMenu}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                aria-label="Playback speed"
              >
                <Sliders size={15} />
                <span style={{ fontSize: '0.75rem', marginLeft: '3px', fontWeight: 600 }}>
                  {playbackRate}x
                </span>
              </button>

              {showSpeedMenu && (
                <div className={styles.speedDropdown}>
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      className={`${styles.speedOption} ${
                        playbackRate === rate ? styles.speedOptionActive : ''
                      }`}
                      onClick={() => handleRateChange(rate)}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && (
              <button
                type="button"
                className={styles.controlBtn}
                onClick={togglePiP}
                aria-label="Picture in Picture"
              >
                <PictureInPicture size={16} />
              </button>
            )}

            <button
              type="button"
              className={styles.controlBtn}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
