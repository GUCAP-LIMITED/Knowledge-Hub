import { useState, type ReactElement } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  Minus,
  Plus,
} from 'lucide-react';
import { cn, useFullscreen, downloadFile } from '@shared/utils';
import { Spinner } from '../Spinner/Spinner';
import styles from './PdfViewer.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.2;

export interface PdfViewerProps {
  readonly url: string;
  readonly title: string;
}

const PdfTopBar = ({
  title,
  numPages,
  url,
  isFullscreen,
  onToggleFullscreen,
}: {
  readonly title: string;
  readonly numPages: number | null;
  readonly url: string;
  readonly isFullscreen: boolean;
  readonly onToggleFullscreen: () => void;
}): ReactElement => (
  <div className={styles.topBar}>
    <span className={styles.title}>{title}</span>
    <div className={styles.topBarActions}>
      {numPages !== null ? (
        <span className={styles.pageCount}>{numPages} pages</span>
      ) : null}
      <a
        href={url}
        download
        onClick={(e) => {
          e.preventDefault();
          void downloadFile(url, title || 'document.pdf');
        }}
        className={styles.iconBtn}
        aria-label="Download PDF"
      >
        <Download size={16} aria-hidden="true" />
      </a>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize size={16} aria-hidden="true" />
        ) : (
          <Maximize size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  </div>
);

const PdfNavButton = ({
  direction,
  onClick,
  disabled,
}: {
  readonly direction: 'prev' | 'next';
  readonly onClick: () => void;
  readonly disabled: boolean;
}): ReactElement => (
  <button
    type="button"
    className={cn(
      styles.navBtn,
      direction === 'prev' ? styles.navBtnLeft : styles.navBtnRight,
    )}
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
  >
    {direction === 'prev' ? (
      <ChevronLeft size={20} aria-hidden="true" />
    ) : (
      <ChevronRight size={20} aria-hidden="true" />
    )}
  </button>
);

const PdfBottomBar = ({
  pageNumber,
  numPages,
  onPageChange,
  scale,
  onZoomOut,
  onZoomIn,
}: {
  readonly pageNumber: number;
  readonly numPages: number | null;
  readonly onPageChange: (page: number) => void;
  readonly scale: number;
  readonly onZoomOut: () => void;
  readonly onZoomIn: () => void;
}): ReactElement => (
  <div className={styles.bottomBar}>
    <span className={styles.pageIndicator}>
      {pageNumber} / {numPages ?? '-'}
    </span>
    <input
      type="range"
      className={styles.slider}
      min={1}
      max={numPages ?? 1}
      value={pageNumber}
      onChange={(event) => {
        onPageChange(Number(event.target.value));
      }}
      aria-label="Page position"
    />
    <div className={styles.zoomControls}>
      <button
        type="button"
        className={styles.zoomBtn}
        onClick={onZoomOut}
        disabled={scale <= MIN_SCALE}
        aria-label="Zoom out"
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.zoomBtn}
        onClick={onZoomIn}
        disabled={scale >= MAX_SCALE}
        aria-label="Zoom in"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  </div>
);

const PdfPageStage = ({
  url,
  pageNumber,
  scale,
  onDocumentLoaded,
  onDocumentFailed,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  readonly url: string;
  readonly pageNumber: number;
  readonly scale: number;
  readonly onDocumentLoaded: (numPages: number) => void;
  readonly onDocumentFailed: () => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
}): ReactElement => (
  <>
    <PdfNavButton direction="prev" onClick={onPrev} disabled={!hasPrev} />
    <div className={styles.pageWrap}>
      <Document
        file={url}
        onLoadSuccess={({ numPages: total }) => {
          onDocumentLoaded(total);
        }}
        onLoadError={onDocumentFailed}
        loading={<Spinner size="lg" />}
        error={<Spinner size="lg" />}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
    <PdfNavButton direction="next" onClick={onNext} disabled={!hasNext} />
  </>
);

/**
 * LinkedIn-style page-by-page PDF viewer: dark chrome, prev/next navigation, zoom, and a page
 * slider. Falls back to a plain browser-native iframe if the rich renderer can't fetch the file
 * itself (e.g. the file's host doesn't allow cross-origin `fetch`, only cross-origin embedding).
 */
export const PdfViewer = ({ url, title }: PdfViewerProps): ReactElement => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [useFallback, setUseFallback] = useState(false);
  const { ref, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();

  const goToPage = (page: number): void => {
    if (numPages === null) return;
    setPageNumber(Math.max(1, Math.min(numPages, page)));
  };

  return (
    <div ref={ref} className={styles.viewer}>
      <PdfTopBar
        title={title}
        numPages={numPages}
        url={url}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <div className={styles.stage}>
        {useFallback ? (
          <iframe className={styles.fallbackFrame} src={url} title={title} />
        ) : (
          <PdfPageStage
            url={url}
            pageNumber={pageNumber}
            scale={scale}
            onDocumentLoaded={(total) => {
              setNumPages(total);
              setPageNumber(1);
            }}
            onDocumentFailed={() => {
              setUseFallback(true);
            }}
            onPrev={() => {
              goToPage(pageNumber - 1);
            }}
            onNext={() => {
              goToPage(pageNumber + 1);
            }}
            hasPrev={pageNumber > 1}
            hasNext={numPages === null || pageNumber < numPages}
          />
        )}
      </div>
      {!useFallback ? (
        <PdfBottomBar
          pageNumber={pageNumber}
          numPages={numPages}
          onPageChange={goToPage}
          scale={scale}
          onZoomOut={() => {
            setScale((prev) =>
              Math.max(MIN_SCALE, Math.round((prev - SCALE_STEP) * 10) / 10),
            );
          }}
          onZoomIn={() => {
            setScale((prev) =>
              Math.min(MAX_SCALE, Math.round((prev + SCALE_STEP) * 10) / 10),
            );
          }}
        />
      ) : null}
    </div>
  );
};
