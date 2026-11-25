import { useState, useCallback, useRef, useEffect } from 'react';
import { downloadFile } from './file-download';

export interface UseFileDownloadReturn {
  readonly isDownloading: boolean;
  readonly download: (url: string, filename?: string) => Promise<boolean>;
  readonly error: Error | null;
}

/**
 * Hook to manage asynchronous file downloading with loading and error states.
 */
export const useFileDownload = (): UseFileDownloadReturn => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const download = useCallback(
    async (url: string, filename?: string): Promise<boolean> => {
      setIsDownloading(true);
      setError(null);
      try {
        await downloadFile(url, filename);
        return true;
      } catch (err) {
        const normalizedError = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(normalizedError);
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsDownloading(false);
        }
      }
    },
    [],
  );

  return { isDownloading, download, error };
};
