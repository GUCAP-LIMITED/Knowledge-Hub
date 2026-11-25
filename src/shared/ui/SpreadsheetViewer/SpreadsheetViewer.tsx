import { useEffect, useState, type ReactElement } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { cn, downloadFile } from '@shared/utils';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import fallbackStyles from '../MediaViewer/MediaViewer.module.css';
import styles from './SpreadsheetViewer.module.css';
import {
  encodeColumnLabel,
  parseWorkbook,
  type ParsedSheet,
  type ParsedWorkbook,
  type SheetGridRow,
} from './spreadsheet-workbook-parser';

export interface SpreadsheetViewerProps {
  readonly url: string;
  readonly title: string;
}

const SheetTabs = ({
  sheetNames,
  activeSheet,
  onSelect,
}: {
  readonly sheetNames: readonly string[];
  readonly activeSheet: string;
  readonly onSelect: (name: string) => void;
}): ReactElement | null => {
  if (sheetNames.length <= 1) return null;

  return (
    <div className={styles.sheetTabs} role="tablist" aria-label="Sheets">
      {sheetNames.map((name) => (
        <button
          key={name}
          type="button"
          role="tab"
          aria-selected={name === activeSheet}
          className={cn(styles.sheetTab, name === activeSheet && styles.sheetTabActive)}
          onClick={() => {
            onSelect(name);
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

const ColumnHeaderRow = ({ colCount }: { readonly colCount: number }): ReactElement => (
  <tr>
    <th className={styles.cornerHeader} scope="col" />
    {Array.from({ length: colCount }, (_, c) => (
      <th key={c} className={styles.colHeader} scope="col">
        {encodeColumnLabel(c)}
      </th>
    ))}
  </tr>
);

const SheetRow = ({
  row,
  rowNumber,
}: {
  readonly row: SheetGridRow;
  readonly rowNumber: number;
}): ReactElement => (
  <tr>
    <th className={styles.rowHeader} scope="row">
      {rowNumber}
    </th>
    {row.map((cell, cellIndex) =>
      cell === null ? null : (
        <td
          key={cellIndex}
          colSpan={cell.colSpan}
          rowSpan={cell.rowSpan}
          // The fill comes from the workbook's own cell styling — one color per uploaded
          // file, not expressible as a finite set of CSS module classes.
          style={cell.fill ? { backgroundColor: cell.fill } : undefined}
          dangerouslySetInnerHTML={{ __html: cell.html || '&nbsp;' }}
        />
      ),
    )}
  </tr>
);

const SheetTable = ({ sheet }: { readonly sheet: ParsedSheet }): ReactElement => {
  if (sheet.rows.length === 0) {
    return <p className={styles.empty}>This sheet has no data.</p>;
  }
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <ColumnHeaderRow colCount={sheet.colCount} />
        </thead>
        <tbody>
          {sheet.rows.map((row, rowIndex) => (
            <SheetRow key={rowIndex} row={row} rowNumber={rowIndex + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SpreadsheetFallback = ({
  url,
  title,
}: {
  readonly url: string;
  readonly title: string;
}): ReactElement => (
  <div className={fallbackStyles.fallbackCard}>
    <p className={fallbackStyles.fallbackDesc}>
      This spreadsheet could not be previewed.
    </p>
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
 * Client-side spreadsheet preview: fetches and parses the workbook with SheetJS and renders
 * real cell data — including merged-cell spans, cell fill colors, rich text (bold/italic/
 * underline/strikethrough) and Excel-style column/row headers — as a table. Avoids the Office
 * Online iframe embed, which needs to fetch the file from a public URL server-side and renders
 * an empty grid against our short-lived signed blob URLs.
 */
export const SpreadsheetViewer = ({
  url,
  title,
}: SpreadsheetViewerProps): ReactElement => {
  const [workbook, setWorkbook] = useState<ParsedWorkbook | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setWorkbook(null);
    setActiveSheet(null);
    setHasError(false);

    parseWorkbook(url)
      .then((parsed) => {
        if (cancelled) return;
        setWorkbook(parsed);
        setActiveSheet(parsed.sheetNames[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (hasError) {
    return <SpreadsheetFallback url={url} title={title} />;
  }

  if (!workbook || activeSheet === null) {
    return <Spinner size="lg" />;
  }

  const sheet = workbook.sheets[activeSheet] ?? { rows: [], colCount: 0 };

  return (
    <div className={styles.viewer}>
      <SheetTabs
        sheetNames={workbook.sheetNames}
        activeSheet={activeSheet}
        onSelect={setActiveSheet}
      />
      <SheetTable sheet={sheet} />
    </div>
  );
};
