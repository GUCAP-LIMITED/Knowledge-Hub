export type FileCategory =
  | 'video'
  | 'document'
  | 'pdfOnly'
  | 'image'
  | 'resource'
  | 'tutorialPrimary'
  | 'assignment';

/** Strictly allowed lowercase extensions per category. */
export const ALLOWED_EXTENSIONS: Record<FileCategory, readonly string[]> = {
  video: ['.mp4', '.mov', '.webm', '.mkv', '.avi'],
  document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
  pdfOnly: ['.pdf'],
  image: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
  resource: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.csv', '.zip'],
  tutorialPrimary: ['.mp4', '.mov', '.webm', '.mkv', '.avi'],
  assignment: [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    '.csv',
    '.zip',
    '.txt',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
  ],
};

/** HTML file input accept strings per category. */
export const ACCEPT_ATTRIBUTES: Record<FileCategory, string> = {
  video:
    'video/mp4,video/quicktime,video/webm,video/x-matroska,video/x-msvideo,.mp4,.mov,.webm,.mkv,.avi',
  document:
    '.pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdfOnly: '.pdf,application/pdf',
  image: 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif',
  resource:
    '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.zip,application/pdf,application/zip,text/csv',
  tutorialPrimary:
    'video/mp4,video/quicktime,video/webm,video/x-matroska,video/x-msvideo,.mp4,.mov,.webm,.mkv,.avi',
  assignment:
    '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.zip,.txt,.png,.jpg,.jpeg,.webp,application/pdf,application/zip,text/plain,image/*',
};

/** User-facing category display names for error messages. */
export const CATEGORY_LABELS: Record<FileCategory, string> = {
  video: 'Video lessons',
  document: 'Document lessons',
  pdfOnly: 'PDF lessons',
  image: 'Image uploads',
  resource: 'Resource downloads',
  tutorialPrimary: 'Tutorial videos',
  assignment: 'Assignment files',
};

/** Common dangerous or invalid extensions explicitly called out in feedback. */
export const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.txt',
  '.zip',
  '.bat',
  '.cmd',
  '.sh',
  '.msi',
  '.dll',
  '.bin',
  '.js',
  '.vbs',
] as const;

/** Extract lowercase file extension including dot, e.g. '.pdf' or empty string. */
export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
};

export interface FileValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

export const MAX_ASSIGNMENT_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

/**
 * Validates whether a file obeys category extension and type restrictions.
 * Rejects disallowed files (e.g. .txt, .zip, .exe in PDF/video lessons) with descriptive feedback.
 */
export const validateFile = (
  file: File,
  category: FileCategory,
): FileValidationResult => {
  const ext = getFileExtension(file.name);
  const allowed = ALLOWED_EXTENSIONS[category];

  if (!ext) {
    return {
      valid: false,
      error: `File "${file.name}" has no extension. Please upload a file with an allowed extension (${allowed.join(', ')}).`,
    };
  }

  if (!allowed.includes(ext)) {
    const isExplicitlyForbidden = (FORBIDDEN_EXTENSIONS as readonly string[]).includes(
      ext,
    );
    const categoryName = CATEGORY_LABELS[category];
    const allowedList = allowed.join(', ');

    if (isExplicitlyForbidden) {
      return {
        valid: false,
        error: `Files with extension "${ext}" cannot be uploaded to ${categoryName}. Supported formats: ${allowedList}.`,
      };
    }

    return {
      valid: false,
      error: `Invalid file extension "${ext}". ${categoryName} only accept: ${allowedList}.`,
    };
  }

  if (category === 'assignment' && file.size > MAX_ASSIGNMENT_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum allowed size of 500 MB.`,
    };
  }

  return { valid: true };
};

/** Validates an array of files against a category. Returns the first error encountered, if any. */
export const validateFileList = (
  files: readonly File[],
  category: FileCategory,
): FileValidationResult => {
  for (const file of files) {
    const result = validateFile(file, category);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};
