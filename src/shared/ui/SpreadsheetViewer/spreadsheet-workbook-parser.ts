import { read, utils, type CellObject, type WorkSheet } from 'xlsx';
import { sanitizeSpreadsheetCellHtml } from '@shared/utils';

export interface SheetCell {
  readonly html: string;
  readonly fill: string | null;
  readonly colSpan: number;
  readonly rowSpan: number;
}

export type SheetGridRow = readonly (SheetCell | null)[];

export interface ParsedSheet {
  readonly rows: readonly SheetGridRow[];
  readonly colCount: number;
}

export interface ParsedWorkbook {
  readonly sheetNames: readonly string[];
  readonly sheets: Readonly<Record<string, ParsedSheet>>;
}

/** Column-letter label (A, B, ..., AA, ...) for a 0-based column index. */
export const encodeColumnLabel = (col: number): string => utils.encode_col(col);

/** Preview caps — this is a preview, not a full data export. */
const MAX_PREVIEW_ROWS = 500;
const MAX_PREVIEW_COLS = 60;
/** A sparsely-filled sheet still renders at least this many rows/cols, so it reads as a grid
 *  (like the source spreadsheet app) instead of a stray, oddly-sized box of text. */
const MIN_GRID_ROWS = 15;
const MIN_GRID_COLS = 8;

interface MergeInfo {
  readonly covered: ReadonlySet<string>;
  readonly spans: ReadonlyMap<
    string,
    { readonly rowSpan: number; readonly colSpan: number }
  >;
}

const cellKey = (r: number, c: number): string => `${String(r)}-${String(c)}`;

const collectMerges = (ws: WorkSheet): MergeInfo => {
  const covered = new Set<string>();
  const spans = new Map<string, { rowSpan: number; colSpan: number }>();
  (ws['!merges'] ?? []).forEach((merge) => {
    spans.set(cellKey(merge.s.r, merge.s.c), {
      rowSpan: merge.e.r - merge.s.r + 1,
      colSpan: merge.e.c - merge.s.c + 1,
    });
    for (let r = merge.s.r; r <= merge.e.r; r += 1) {
      for (let c = merge.s.c; c <= merge.e.c; c += 1) {
        if (r !== merge.s.r || c !== merge.s.c) covered.add(cellKey(r, c));
      }
    }
  });
  return { covered, spans };
};

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

interface CellFill {
  readonly patternType?: string;
  readonly fgColor?: { readonly rgb?: string };
}

/** A solid fill's color, as `#rrggbb` — `cellStyles` only ever resolves solid fills. */
const resolveFill = (cell: CellObject): string | null => {
  const fill = cell.s as CellFill | undefined;
  const rgb = fill?.fgColor?.rgb;
  if (fill?.patternType !== 'solid' || !rgb) return null;
  return `#${rgb.length === 8 ? rgb.slice(2) : rgb}`;
};

/**
 * `cellHTML` gives string cells a pre-escaped `.h` (rich runs render bold/italic/underline/
 * strikethrough inline styles); non-string cells never get one, so their formatted text is
 * escaped here instead — both paths land in `dangerouslySetInnerHTML`, so neither can skip it.
 */
const resolveHtml = (cell: CellObject | undefined): string => {
  if (!cell) return '';
  const richHtml = (cell as CellObject & { h?: string }).h;
  if (richHtml) return sanitizeSpreadsheetCellHtml(richHtml);
  const text = cell.w ?? cell.v;
  return text === undefined ? '' : escapeHtml(String(text));
};

interface GridContext {
  readonly ws: WorkSheet;
  readonly lastCol: number;
  readonly merges: MergeInfo;
}

const buildGridRow = (ctx: GridContext, r: number): SheetGridRow => {
  const row: (SheetCell | null)[] = [];
  for (let c = 0; c <= ctx.lastCol; c += 1) {
    const key = cellKey(r, c);
    if (ctx.merges.covered.has(key)) {
      row.push(null);
      continue;
    }
    // The library's WorkSheet index signature widens to `any` for cell lookups.
    const cell = ctx.ws[utils.encode_cell({ r, c })] as CellObject | undefined;
    const span = ctx.merges.spans.get(key);
    row.push({
      html: resolveHtml(cell),
      fill: cell ? resolveFill(cell) : null,
      colSpan: span?.colSpan ?? 1,
      rowSpan: span?.rowSpan ?? 1,
    });
  }
  return row;
};

const buildSheetGrid = (ws: WorkSheet): ParsedSheet => {
  const ref = ws['!ref'];
  if (!ref) return { rows: [], colCount: 0 };

  const range = utils.decode_range(ref);
  const lastCol = Math.min(Math.max(range.e.c, MIN_GRID_COLS - 1), MAX_PREVIEW_COLS - 1);
  const lastRow = Math.min(Math.max(range.e.r, MIN_GRID_ROWS - 1), MAX_PREVIEW_ROWS - 1);
  const ctx: GridContext = { ws, lastCol, merges: collectMerges(ws) };

  const rows: SheetGridRow[] = [];
  for (let r = 0; r <= lastRow; r += 1) {
    rows.push(buildGridRow(ctx, r));
  }
  return { rows, colCount: lastCol + 1 };
};

export const parseWorkbook = async (url: string): Promise<ParsedWorkbook> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet (${String(response.status)})`);
  }
  const buffer = await response.arrayBuffer();
  const workbook = read(buffer, { type: 'array', cellHTML: true, cellStyles: true });
  const sheets: Record<string, ParsedSheet> = {};
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    sheets[name] = sheet ? buildSheetGrid(sheet) : { rows: [], colCount: 0 };
  });
  return { sheetNames: workbook.SheetNames, sheets };
};
