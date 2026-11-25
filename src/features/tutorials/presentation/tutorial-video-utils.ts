/**
 * Presentation layer video duration measurement (requires browser/DOM).
 * Re-exports pure string formatting functions from domain.
 */
export {
  formatVideoTitle,
  formatVideoTimestamp,
  formatPlaylistDuration,
  computePlaylistTotalDuration,
  type PlaylistDurationVideoItem,
} from '../domain/tutorial-video-utils';

/**
 * Measures the duration of a local video File in seconds using an in-memory HTMLVideoElement.
 * Includes a safety timeout fallback to prevent hanging in headless/unsupported environments.
 */
export const measureVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        resolve(0);
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';

      let cleanedUp = false;
      let objectUrl = '';

      const cleanup = (): void => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (
            objectUrl &&
            typeof URL !== 'undefined' &&
            typeof URL.revokeObjectURL === 'function'
          ) {
            URL.revokeObjectURL(objectUrl);
          }
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(0);
      }, 3000);

      video.onloadedmetadata = (): void => {
        clearTimeout(timer);
        cleanup();
        const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0;
        resolve(duration);
      };

      video.onerror = (): void => {
        clearTimeout(timer);
        cleanup();
        resolve(0);
      };

      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;
      } else {
        clearTimeout(timer);
        resolve(0);
      }
    } catch {
      resolve(0);
    }
  });
