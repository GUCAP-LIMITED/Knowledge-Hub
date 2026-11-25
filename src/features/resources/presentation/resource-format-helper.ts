import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';
import type { Resource } from '../domain';

export interface DocumentItem {
  readonly id: string;
  readonly name: string;
  readonly url: string | null;
  readonly sizeBytes?: number | undefined;
  readonly isPrimary: boolean;
}

/** Flattens a resource's primary file (if any) and its attachments into one orderable list. */
export const buildDocuments = (resource: Resource): DocumentItem[] => {
  const list: DocumentItem[] = [];
  if (resource.mediaUrl) {
    list.push({
      id: 'primary',
      name: resource.primaryMediaName ? resource.primaryMediaName : resource.title,
      url: resource.mediaUrl,
      sizeBytes: resource.primaryMediaSizeBytes,
      isPrimary: true,
    });
  }
  resource.attachments.forEach((att) => {
    list.push({
      id: att.id,
      name: att.name,
      url: att.url ?? null,
      sizeBytes: att.sizeBytes,
      isPrimary: false,
    });
  });
  return list;
};

export type DocumentCategory =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'image'
  | 'video'
  | 'text'
  | 'other';

export interface FileFormatInfo {
  readonly category: DocumentCategory;
  readonly extension: string;
  readonly label: string;
  readonly iconClass: string;
  readonly isOffice: boolean;
}

const EXTENSION_MAP: Readonly<
  Record<
    string,
    { category: DocumentCategory; label: string; iconClass: string; isOffice: boolean }
  >
> = {
  pdf: {
    category: 'pdf',
    label: 'PDF Document',
    iconClass: styles.iconPdf ?? '',
    isOffice: false,
  },
  docx: {
    category: 'word',
    label: 'Microsoft Word (DOCX)',
    iconClass: styles.iconWord ?? '',
    isOffice: true,
  },
  doc: {
    category: 'word',
    label: 'Word Document (DOC)',
    iconClass: styles.iconWord ?? '',
    isOffice: true,
  },
  xlsx: {
    category: 'excel',
    label: 'Microsoft Excel (XLSX)',
    iconClass: styles.iconExcel ?? '',
    isOffice: true,
  },
  xls: {
    category: 'excel',
    label: 'Excel Spreadsheet (XLS)',
    iconClass: styles.iconExcel ?? '',
    isOffice: true,
  },
  csv: {
    category: 'excel',
    label: 'CSV Spreadsheet',
    iconClass: styles.iconExcel ?? '',
    isOffice: true,
  },
  pptx: {
    category: 'powerpoint',
    label: 'Microsoft PowerPoint (PPTX)',
    iconClass: styles.iconPpt ?? '',
    isOffice: true,
  },
  ppt: {
    category: 'powerpoint',
    label: 'PowerPoint Presentation (PPT)',
    iconClass: styles.iconPpt ?? '',
    isOffice: true,
  },
  jpg: {
    category: 'image',
    label: 'Image (JPEG)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  jpeg: {
    category: 'image',
    label: 'Image (JPEG)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  png: {
    category: 'image',
    label: 'Image (PNG)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  webp: {
    category: 'image',
    label: 'Image (WebP)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  svg: {
    category: 'image',
    label: 'Vector Graphic (SVG)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  gif: {
    category: 'image',
    label: 'Animated Image (GIF)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  mp4: {
    category: 'video',
    label: 'Video (MP4)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  webm: {
    category: 'video',
    label: 'Video (WebM)',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  txt: {
    category: 'text',
    label: 'Text Document',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
  md: {
    category: 'text',
    label: 'Markdown Document',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  },
};

export const getFormatInfo = (url: string, title?: string): FileFormatInfo => {
  const cleanUrl = url.split('?')[0]?.toLowerCase() ?? '';
  const urlExt = cleanUrl.split('.').pop() ?? '';
  const titleExt = title?.split('.').pop()?.toLowerCase() ?? '';
  const ext = urlExt.length > 0 && urlExt.length <= 5 ? urlExt : titleExt;

  const matched = EXTENSION_MAP[ext];
  if (matched) {
    return { ...matched, extension: ext };
  }

  return {
    category: 'other',
    extension: ext,
    label: 'Document File',
    iconClass: styles.iconDefault ?? '',
    isOffice: false,
  };
};
