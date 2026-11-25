/**
 * Utility functions for reliable direct file downloads in web browsers.
 *
 * Browsers intentionally ignore the HTML5 `download` attribute on cross-origin URLs
 * (e.g. cloud storage like Azure Blob, S3, or remote API servers), which causes links
 * to navigate or open files (like PDFs) in a new tab rather than initiating a download.
 *
 * `downloadFile` bypasses this limitation by fetching the asset and converting it
 * into a same-origin object URL before triggering the anchor download, ensuring the
 * file saves directly to disk with the requested filename.
 */

/**
 * Extracts a readable filename from a URL path, stripping query parameters.
 */
export const getFilenameFromUrl = (url: string, defaultName = 'download'): string => {
  try {
    const parsed = new URL(url, window.location.origin || 'http://localhost');
    const lastSegment = parsed.pathname.split('/').filter(Boolean).pop();
    if (lastSegment) {
      return decodeURIComponent(lastSegment);
    }
  } catch {
    const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
    const lastSegment = cleanUrl.split('/').filter(Boolean).pop();
    if (lastSegment && lastSegment !== 'http:' && lastSegment !== 'https:') {
      return decodeURIComponent(lastSegment);
    }
  }
  return defaultName;
};

const triggerAnchorDownload = (
  url: string,
  filename: string,
  openInNewTabFallback = false,
): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  if (openInNewTabFallback) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Directly downloads a file to the user's device.
 *
 * @param url The resource URL to download (HTTP, HTTPS, blob, or data URL).
 * @param filename Optional custom filename to save as. Defaults to filename in URL.
 */
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  if (!url || typeof url !== 'string') {
    throw new Error('A valid URL is required to download a file.');
  }

  const trimmedFilename = filename?.trim();
  const resolvedFilename =
    trimmedFilename && trimmedFilename.length > 0
      ? trimmedFilename
      : getFilenameFromUrl(url);

  // If the URL is already a Blob URL or Data URL, it is already same-origin in memory
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    triggerAnchorDownload(url, resolvedFilename);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${String(response.status)} ${response.statusText}`,
      );
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    try {
      triggerAnchorDownload(objectUrl, resolvedFilename);
    } finally {
      // Delay revoking slightly to ensure the browser has registered the download click
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  } catch (error) {
    // Fallback: If fetch fails (e.g. strict CORS blocking fetch), fallback to standard anchor navigation
    triggerAnchorDownload(url, resolvedFilename, true);
    throw error;
  }
};
