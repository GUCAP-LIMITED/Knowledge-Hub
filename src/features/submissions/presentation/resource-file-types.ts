import styles from './ResourceFileTypeIcon.module.css';

export type ResourceCategoryKey =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'archive'
  | 'image'
  | 'code'
  | 'other';

export interface ResourceCategoryMeta {
  readonly key: ResourceCategoryKey;
  readonly label: string;
  readonly badgeText: string;
  readonly tileClass: string;
  readonly iconSize: number;
}

const CATEGORY_MAP: Record<
  ResourceCategoryKey,
  Omit<ResourceCategoryMeta, 'iconSize'>
> = {
  pdf: {
    key: 'pdf',
    label: 'Adobe PDF Document',
    badgeText: 'PDF',
    tileClass: styles.iconPdf ?? '',
  },
  word: {
    key: 'word',
    label: 'Microsoft Word Document',
    badgeText: 'DOCX',
    tileClass: styles.iconWord ?? '',
  },
  excel: {
    key: 'excel',
    label: 'Spreadsheet Document',
    badgeText: 'XLSX',
    tileClass: styles.iconExcel ?? '',
  },
  powerpoint: {
    key: 'powerpoint',
    label: 'PowerPoint Presentation',
    badgeText: 'PPTX',
    tileClass: styles.iconPpt ?? '',
  },
  archive: {
    key: 'archive',
    label: 'Compressed Archive',
    badgeText: 'ZIP',
    tileClass: styles.iconArchive ?? '',
  },
  image: {
    key: 'image',
    label: 'Image Asset',
    badgeText: 'IMG',
    tileClass: styles.iconImage ?? '',
  },
  code: {
    key: 'code',
    label: 'Code / Text Document',
    badgeText: 'TXT',
    tileClass: styles.iconCode ?? '',
  },
  other: {
    key: 'other',
    label: 'Resource Document',
    badgeText: 'DOC',
    tileClass: styles.iconDefault ?? '',
  },
};

const isPdf = (ext: string, mime: string): boolean =>
  ext === 'pdf' || mime.includes('pdf');

const isWord = (ext: string, mime: string): boolean =>
  ['doc', 'docx', 'docm', 'dot', 'dotx'].includes(ext) ||
  mime.includes('word') ||
  mime.includes('officedocument.wordprocessingml');

const isExcel = (ext: string, mime: string): boolean =>
  ['xls', 'xlsx', 'csv', 'xlsm'].includes(ext) ||
  mime.includes('spreadsheet') ||
  mime.includes('excel') ||
  mime === 'text/csv';

const isPowerPoint = (ext: string, mime: string): boolean =>
  ['ppt', 'pptx', 'pps', 'ppsx', 'pot', 'potx'].includes(ext) ||
  mime.includes('presentation') ||
  mime.includes('powerpoint');

const isArchive = (ext: string, mime: string): boolean =>
  ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) ||
  mime.includes('zip') ||
  mime.includes('compressed') ||
  mime.includes('archive');

const isImage = (ext: string, mime: string): boolean =>
  ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mime.startsWith('image/');

const isCode = (ext: string, mime: string): boolean =>
  ['txt', 'json', 'md', 'xml'].includes(ext) || mime.startsWith('text/');

interface CategoryMatcher {
  readonly match: (ext: string, mime: string) => boolean;
  readonly getMeta: (ext: string) => ResourceCategoryMeta;
}

const MATCHERS: readonly CategoryMatcher[] = [
  { match: isPdf, getMeta: () => ({ ...CATEGORY_MAP.pdf, iconSize: 20 }) },
  {
    match: isWord,
    getMeta: (ext) => ({
      ...CATEGORY_MAP.word,
      badgeText: ext === 'doc' ? 'DOC' : 'DOCX',
      iconSize: 20,
    }),
  },
  {
    match: isExcel,
    getMeta: (ext) => ({
      ...CATEGORY_MAP.excel,
      badgeText: ext === 'csv' ? 'CSV' : ext.toUpperCase() || 'XLSX',
      iconSize: 20,
    }),
  },
  {
    match: isPowerPoint,
    getMeta: (ext) => ({
      ...CATEGORY_MAP.powerpoint,
      badgeText: ext === 'ppt' ? 'PPT' : 'PPTX',
      iconSize: 20,
    }),
  },
  {
    match: isArchive,
    getMeta: (ext) => ({
      ...CATEGORY_MAP.archive,
      badgeText: ext.toUpperCase() || 'ZIP',
      iconSize: 20,
    }),
  },
  {
    match: isImage,
    getMeta: (ext) => ({
      ...CATEGORY_MAP.image,
      badgeText: ext.toUpperCase() || 'IMG',
      iconSize: 20,
    }),
  },
  {
    match: isCode,
    getMeta: (ext) => ({
      ...CATEGORY_MAP.code,
      badgeText: ext.toUpperCase() || 'TXT',
      iconSize: 20,
    }),
  },
];

export const resolveResourceCategory = (
  fileName?: string | null,
  mimeType?: string | null,
): ResourceCategoryMeta => {
  const safeName = (fileName ?? '').trim().toLowerCase();
  const ext = safeName.split('.').pop() ?? '';
  const safeMime = (mimeType ?? '').trim().toLowerCase();

  const matched = MATCHERS.find((m) => m.match(ext, safeMime));
  if (matched) {
    return matched.getMeta(ext);
  }

  const badgeText = ext && ext.length <= 4 ? ext.toUpperCase() : 'DOC';
  return { ...CATEGORY_MAP.other, badgeText, iconSize: 20 };
};

export const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null || bytes <= 0) {
    return 'Unknown size';
  }
  if (bytes < 1024) {
    return `${String(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2).replace(/\.?0+$/, '')} GB`;
};
