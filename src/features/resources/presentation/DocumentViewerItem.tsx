import { type ReactElement, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@shared/ui';
import { usePlaybackUrl } from '@features/playback';
import { DocumentViewerToolbar } from './DocumentViewerToolbar';
import { DocumentViewerContent } from './DocumentViewerContent';
import {
  type DocumentItem,
  type FileFormatInfo,
  getFormatInfo,
} from './resource-format-helper';
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';

export interface DocumentViewerItemProps {
  readonly document: DocumentItem;
  readonly index: number;
  readonly total: number;
}

const isDirectHttpUrl = (url?: string | null): boolean => {
  if (!url) {
    return false;
  }
  return (
    url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')
  );
};

const getPlaybackId = (url: string | null, isDirect: boolean): string | null => {
  if (isDirect) {
    return null;
  }
  return url;
};

const resolveUrl = (
  isDirect: boolean,
  documentUrl: string | null,
  dataUrl?: string,
): string => {
  if (isDirect) {
    return documentUrl ?? '';
  }
  return dataUrl ?? '';
};

const resolveErrorMessage = (hasError: boolean, errorMsg?: string): string => {
  if (hasError && errorMsg) {
    return errorMsg;
  }
  return 'Failed to load document preview';
};

const FallbackMessage = ({
  message,
  isError = false,
}: {
  readonly message: string;
  readonly isError?: boolean;
}): ReactElement => (
  <div className={styles.fallback}>
    <AlertCircle
      size={40}
      className={isError ? 'text-destructive mb-4' : undefined}
      style={
        isError ? undefined : { marginBottom: '1rem', color: 'var(--color-text-muted)' }
      }
    />
    <p className={styles.fallbackText}>{message}</p>
  </div>
);

interface ResolvedState {
  readonly resolvedUrl: string;
  readonly formatInfo: FileFormatInfo | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}

const useResolvedDocState = (document: DocumentItem): ResolvedState => {
  const isDirect = isDirectHttpUrl(document.url);
  const playbackId = getPlaybackId(document.url, isDirect);
  const { data, isLoading, isError, error } = usePlaybackUrl(playbackId);

  const resolvedUrl = resolveUrl(isDirect, document.url, data?.url);
  const formatInfo = useMemo(() => {
    if (!resolvedUrl) {
      return null;
    }
    return getFormatInfo(resolvedUrl, document.name);
  }, [resolvedUrl, document.name]);

  if (!document.url) {
    return {
      resolvedUrl: '',
      formatInfo: null,
      isLoading: false,
      errorMessage: 'No document or media available.',
    };
  }

  if (!isDirect && isLoading) {
    return {
      resolvedUrl: '',
      formatInfo: null,
      isLoading: true,
      errorMessage: null,
    };
  }

  const isFailed = !isDirect && isError;
  if (isFailed || !resolvedUrl || !formatInfo) {
    return {
      resolvedUrl: '',
      formatInfo: null,
      isLoading: false,
      errorMessage: resolveErrorMessage(isFailed, error?.message),
    };
  }

  return { resolvedUrl, formatInfo, isLoading: false, errorMessage: null };
};

export const DocumentViewerItem = ({
  document,
  index,
  total,
}: DocumentViewerItemProps): ReactElement => {
  const { resolvedUrl, formatInfo, isLoading, errorMessage } =
    useResolvedDocState(document);

  if (isLoading) {
    return <Skeleton width="100%" height={480} radius={12} />;
  }

  if (errorMessage !== null || !formatInfo) {
    const message = errorMessage ?? 'Failed to load document preview';
    const isError = Boolean(document.url);
    return <FallbackMessage message={message} isError={isError} />;
  }

  const officeViewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
    resolvedUrl,
  )}`;

  // The PDF viewer has its own title/page-count/download chrome, so the generic
  // toolbar + fixed-height frame would just duplicate it — render it bare instead.
  if (formatInfo.category === 'pdf') {
    return (
      <DocumentViewerContent
        title={document.name}
        formatInfo={formatInfo}
        resolvedUrl={resolvedUrl}
        officeViewUrl={officeViewUrl}
      />
    );
  }

  return (
    <>
      <DocumentViewerToolbar
        title={document.name}
        formatInfo={formatInfo}
        resolvedUrl={resolvedUrl}
        officeViewUrl={officeViewUrl}
        index={index}
        total={total}
      />
      <div className={styles.docContainer}>
        <DocumentViewerContent
          title={document.name}
          formatInfo={formatInfo}
          resolvedUrl={resolvedUrl}
          officeViewUrl={officeViewUrl}
        />
      </div>
    </>
  );
};
