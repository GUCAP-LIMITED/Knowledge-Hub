import { useEffect, useState, type ReactElement } from 'react';
import mammoth from 'mammoth';
import { Download, ExternalLink } from 'lucide-react';
import { downloadFile } from '@shared/utils';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import fallbackStyles from '../MediaViewer/MediaViewer.module.css';
import { sanitizeDocumentHtml } from './sanitize-document-html';
import styles from './WordDocViewer.module.css';

export interface WordDocViewerProps {
  readonly url: string;
  readonly title: string;
}

/**
 * Mammoth's built-in run conversion already emits `<strong>`/`<em>`/`<s>`/`<sup>`/`<sub>` for
 * bold/italic/strikethrough/super/subscript without any configuration, but silently drops
 * underline and highlight unless a style map says where they go.
 */
const STYLE_MAP = ['u => u', 'highlight => mark'];

const convertDocument = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch document (${String(response.status)})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    { convertImage: mammoth.images.dataUri, styleMap: STYLE_MAP },
  );
  return sanitizeDocumentHtml(result.value);
};

const WordDocFallback = ({
  url,
  title,
}: {
  readonly url: string;
  readonly title: string;
}): ReactElement => (
  <div className={fallbackStyles.fallbackCard}>
    <p className={fallbackStyles.fallbackDesc}>This document could not be previewed.</p>
    <div className={fallbackStyles.fallbackActions}>
      <Button asChild variant="outline" size="sm">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink aria-hidden="true" />
          <span>Open in a new tab</span>
        </a>
      </Button>
      <Button asChild size="sm">
        <a
          href={url}
          download={title}
          onClick={(e) => {
            e.preventDefault();
            void downloadFile(url, title);
          }}
        >
          <Download aria-hidden="true" />
          <span>Download File</span>
        </a>
      </Button>
    </div>
  </div>
);

/**
 * Client-side Word document preview: converts the .docx to HTML with mammoth and renders it
 * (sanitized via `sanitizeDocumentHtml` first). Avoids the Office Online iframe embed, which
 * needs to fetch the file from a public URL server-side and fails silently — an empty-looking
 * viewer — against our short-lived signed blob URLs.
 */
export const WordDocViewer = ({ url, title }: WordDocViewerProps): ReactElement => {
  const [html, setHtml] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    setHasError(false);

    convertDocument(url)
      .then((converted) => {
        if (!cancelled) setHtml(converted);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (hasError) {
    return <WordDocFallback url={url} title={title} />;
  }

  if (html === null) {
    return <Spinner size="lg" />;
  }

  return (
    <div className={styles.viewer}>
      {/* Sanitized just above via sanitizeDocumentHtml — safe structural subset only. */}
      <div className={styles.document} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
