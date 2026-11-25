import { lazy, Suspense, type ReactElement } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { Spinner, VideoPlayer } from '@shared/ui';
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';
import { LegacyDocCard } from './LegacyDocCard';
import {
  DOCUMENT_VIEWER_BACKGROUND,
  DOCUMENT_VIEWER_THEME,
} from './document-viewer-theme';
import { type FileFormatInfo } from './resource-format-helper';

// Lazy-loaded: react-pdf/pdfjs-dist touches browser-only APIs (e.g. DOMMatrix) at import time,
// which breaks unrelated component tests. Import the file directly (not the @shared/ui barrel)
// so merely rendering this module never triggers it either.
const PdfViewer = lazy(async () => ({
  default: (await import('@shared/ui/PdfViewer/PdfViewer')).PdfViewer,
}));

// Lazy-loaded to keep the SheetJS parser out of the main bundle until an xlsx is actually opened.
const SpreadsheetViewer = lazy(async () => ({
  default: (await import('@shared/ui/SpreadsheetViewer/SpreadsheetViewer'))
    .SpreadsheetViewer,
}));

// Lazy-loaded to keep mammoth out of the main bundle until a docx is actually opened.
const WordDocViewer = lazy(async () => ({
  default: (await import('@shared/ui/WordDocViewer/WordDocViewer')).WordDocViewer,
}));

const OfficeEmbedViewer = ({
  title,
  resolvedUrl,
  extension,
}: {
  readonly title: string;
  readonly resolvedUrl: string;
  readonly extension: string;
}): ReactElement => (
  <div className={styles.docViewerWrapper}>
    <DocViewer
      documents={[
        {
          uri: resolvedUrl,
          fileName: title,
          ...(extension ? { fileType: extension } : {}),
        },
      ]}
      pluginRenderers={DocViewerRenderers}
      config={{
        header: {
          disableHeader: true,
          disableFileName: true,
          retainURLParams: false,
        },
        pdfZoom: {
          defaultZoom: 1,
          zoomJump: 0.2,
        },
        pdfVerticalScrollByDefault: true,
      }}
      theme={DOCUMENT_VIEWER_THEME}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: DOCUMENT_VIEWER_BACKGROUND,
      }}
    />
  </div>
);

export interface DocumentViewerContentProps {
  readonly title: string;
  readonly formatInfo: FileFormatInfo;
  readonly resolvedUrl: string;
  readonly officeViewUrl: string;
}

export const DocumentViewerContent = ({
  title,
  formatInfo,
  resolvedUrl,
  officeViewUrl,
}: DocumentViewerContentProps): ReactElement => {
  if (formatInfo.category === 'image') {
    return <img src={resolvedUrl} alt={title} className={styles.image} />;
  }

  if (formatInfo.category === 'video') {
    return <VideoPlayer src={resolvedUrl} title={title} />;
  }

  if (formatInfo.category === 'pdf') {
    return (
      <Suspense fallback={<Spinner size="lg" />}>
        <PdfViewer url={resolvedUrl} title={title} />
      </Suspense>
    );
  }

  if (formatInfo.extension === 'xlsx') {
    return (
      <Suspense fallback={<Spinner size="lg" />}>
        <SpreadsheetViewer url={resolvedUrl} title={title} />
      </Suspense>
    );
  }

  if (formatInfo.extension === 'docx') {
    return (
      <Suspense fallback={<Spinner size="lg" />}>
        <WordDocViewer url={resolvedUrl} title={title} />
      </Suspense>
    );
  }

  const isLegacy = ['doc', 'ppt', 'xls'].includes(formatInfo.extension);
  if (isLegacy) {
    return (
      <LegacyDocCard
        title={title}
        formatInfo={formatInfo}
        resolvedUrl={resolvedUrl}
        officeViewUrl={officeViewUrl}
      />
    );
  }

  return (
    <OfficeEmbedViewer
      title={title}
      resolvedUrl={resolvedUrl}
      extension={formatInfo.extension}
    />
  );
};
