/**
 * Pure domain utilities for formatting video titles and timestamps.
 * Free of presentation, browser, and framework dependencies.
 */

/**
 * Strips file extensions and normalizes separators to generate a clean, human-friendly video title.
 * e.g., "01 - Introduction_To_ABP.mp4" -> "01 - Introduction To ABP"
 */
export const formatVideoTitle = (fileName?: string | null, index?: number): string => {
  if (!fileName) {
    return typeof index === 'number' ? `Part ${String(index + 1)}` : 'Video';
  }

  // Strip file extensions like .mp4, .mov, .webm, .mkv, .avi
  const withoutExt = fileName.replace(/\.[a-zA-Z0-9]+$/, '');

  // Normalize underscores and multiple spaces/hyphens
  const cleaned = withoutExt.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

  return cleaned || (typeof index === 'number' ? `Part ${String(index + 1)}` : 'Video');
};

/**
 * Formats a duration in seconds to standard media timestamp format mm:ss (or hh:mm:ss / h:mm:ss if >= 1 hour).
 */
export const formatVideoTimestamp = (totalSeconds = 0, padHours = false): string => {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const paddedSeconds = seconds.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');

  if (hours > 0) {
    const formattedHours = padHours ? hours.toString().padStart(2, '0') : String(hours);
    return `${formattedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
};

/**
 * Formats a duration in seconds for playlist items.
 * Returns '--:--' when the duration is missing or non-positive.
 * Formats hours with 2 digits (e.g., '04:01:33').
 */
export const formatPlaylistDuration = (
  seconds?: number | null,
  padHours = true,
): string => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
    return '--:--';
  }
  return formatVideoTimestamp(seconds, padHours);
};

export interface PlaylistDurationVideoItem {
  readonly durationSeconds?: number | null | undefined;
}

/**
 * Computes the aggregate duration in seconds for a list of video parts.
 */
export const computePlaylistTotalDuration = (
  videos?: readonly PlaylistDurationVideoItem[] | null,
): number => {
  if (!videos || !Array.isArray(videos)) return 0;
  return videos.reduce<number>((acc: number, v: PlaylistDurationVideoItem): number => {
    const sec =
      typeof v.durationSeconds === 'number' &&
      Number.isFinite(v.durationSeconds) &&
      v.durationSeconds > 0
        ? v.durationSeconds
        : 0;
    return acc + sec;
  }, 0);
};
