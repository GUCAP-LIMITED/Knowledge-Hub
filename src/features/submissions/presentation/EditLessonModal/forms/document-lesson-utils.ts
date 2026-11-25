/**
 * Pure utilities for resolving document lesson MIME types and MediaViewer kinds.
 * Allowed Office formats for document lessons are Word (.doc, .docx) and PowerPoint (.ppt, .pptx).
 */

const OFFICE_EXTENSIONS = ['.doc', '.docx', '.ppt', '.pptx'] as const;

export const resolveDocumentMediaKind = (
  fileNameOrUrl?: string | null,
): 'pdf' | 'doc' => {
  if (!fileNameOrUrl) return 'pdf';
  const clean = fileNameOrUrl.split('?')[0] ?? '';
  const ext = clean.slice(clean.lastIndexOf('.')).toLowerCase();
  return (OFFICE_EXTENSIONS as readonly string[]).includes(ext) ? 'doc' : 'pdf';
};

export const resolveDocumentMimeType = (
  fileName: string,
  rawMimeType?: string,
): string => {
  if (rawMimeType && rawMimeType !== 'application/octet-stream') {
    return rawMimeType;
  }
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  switch (ext) {
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':
      return 'application/msword';
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    case '.pdf':
      return 'application/pdf';
    default:
      return rawMimeType ?? 'application/octet-stream';
  }
};
