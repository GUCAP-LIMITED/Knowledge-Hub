import { describe, expect, it } from 'vitest';
import {
  ACCEPT_ATTRIBUTES,
  ALLOWED_EXTENSIONS,
  validateFile,
  validateFileList,
} from './file-validation';

describe('file-validation tutorialPrimary restrictions', () => {
  it('strictly excludes .pdf and documents from ALLOWED_EXTENSIONS.tutorialPrimary', () => {
    expect(ALLOWED_EXTENSIONS.tutorialPrimary).toEqual([
      '.mp4',
      '.mov',
      '.webm',
      '.mkv',
      '.avi',
    ]);
    expect(ALLOWED_EXTENSIONS.tutorialPrimary).not.toContain('.pdf');
    expect(ALLOWED_EXTENSIONS.tutorialPrimary).not.toContain('.docx');
  });

  it('strictly excludes application/pdf and .pdf from ACCEPT_ATTRIBUTES.tutorialPrimary', () => {
    expect(ACCEPT_ATTRIBUTES.tutorialPrimary).not.toContain('application/pdf');
    expect(ACCEPT_ATTRIBUTES.tutorialPrimary).not.toContain('.pdf');
    expect(ACCEPT_ATTRIBUTES.tutorialPrimary).toContain('video/mp4');
  });

  it('approves supported video files for tutorialPrimary', () => {
    const mp4File = new File(['video-content'], 'lesson.mp4', { type: 'video/mp4' });
    const movFile = new File(['video-content'], 'lesson.mov', {
      type: 'video/quicktime',
    });
    const webmFile = new File(['video-content'], 'lesson.webm', { type: 'video/webm' });
    const mkvFile = new File(['video-content'], 'lesson.mkv', {
      type: 'video/x-matroska',
    });
    const aviFile = new File(['video-content'], 'lesson.avi', {
      type: 'video/x-msvideo',
    });

    expect(validateFile(mp4File, 'tutorialPrimary')).toEqual({ valid: true });
    expect(validateFile(movFile, 'tutorialPrimary')).toEqual({ valid: true });
    expect(validateFile(webmFile, 'tutorialPrimary')).toEqual({ valid: true });
    expect(validateFile(mkvFile, 'tutorialPrimary')).toEqual({ valid: true });
    expect(validateFile(aviFile, 'tutorialPrimary')).toEqual({ valid: true });
  });

  it('rejects PDF and document files for tutorialPrimary with descriptive feedback', () => {
    const pdfFile = new File(['dummy-content'], 'manual.pdf', {
      type: 'application/pdf',
    });
    const docxFile = new File(['dummy-content'], 'notes.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const pdfResult = validateFile(pdfFile, 'tutorialPrimary');
    expect(pdfResult.valid).toBe(false);
    expect(pdfResult.error).toContain('Tutorial videos only accept:');
    expect(pdfResult.error).toContain('.mp4, .mov, .webm, .mkv, .avi');

    const docxResult = validateFile(docxFile, 'tutorialPrimary');
    expect(docxResult.valid).toBe(false);
    expect(docxResult.error).toContain('Tutorial videos only accept:');
  });

  it('rejects forbidden file types such as .zip and .exe for tutorialPrimary', () => {
    const zipFile = new File(['archive'], 'bundle.zip', { type: 'application/zip' });
    const exeFile = new File(['binary'], 'installer.exe', {
      type: 'application/x-msdownload',
    });

    const zipResult = validateFile(zipFile, 'tutorialPrimary');
    expect(zipResult.valid).toBe(false);
    expect(zipResult.error).toContain(
      'Files with extension ".zip" cannot be uploaded to Tutorial videos.',
    );

    const exeResult = validateFile(exeFile, 'tutorialPrimary');
    expect(exeResult.valid).toBe(false);
    expect(exeResult.error).toContain(
      'Files with extension ".exe" cannot be uploaded to Tutorial videos.',
    );
  });

  it('rejects files without an extension', () => {
    const noExtFile = new File(['content'], 'videofile', { type: 'video/mp4' });
    const result = validateFile(noExtFile, 'tutorialPrimary');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('has no extension');
  });

  it('validates lists of files rejecting if any non-video file is present', () => {
    const mp4File = new File(['video'], 'intro.mp4', { type: 'video/mp4' });
    const pdfFile = new File(['doc'], 'guide.pdf', { type: 'application/pdf' });

    const mixedResult = validateFileList([mp4File, pdfFile], 'tutorialPrimary');
    expect(mixedResult.valid).toBe(false);
    expect(mixedResult.error).toContain('Tutorial videos only accept:');

    const validResult = validateFileList([mp4File], 'tutorialPrimary');
    expect(validResult.valid).toBe(true);
  });
});

describe('file-validation document category restrictions', () => {
  it('allows PDF, Word, and PowerPoint in ALLOWED_EXTENSIONS.document and excludes spreadsheets', () => {
    expect(ALLOWED_EXTENSIONS.document).toEqual([
      '.pdf',
      '.doc',
      '.docx',
      '.ppt',
      '.pptx',
    ]);
    expect(ALLOWED_EXTENSIONS.document).not.toContain('.xls');
    expect(ALLOWED_EXTENSIONS.document).not.toContain('.xlsx');
  });

  it('includes Word and PowerPoint MIME types in ACCEPT_ATTRIBUTES.document without spreadsheets', () => {
    expect(ACCEPT_ATTRIBUTES.document).toContain('.docx');
    expect(ACCEPT_ATTRIBUTES.document).toContain('.pptx');
    expect(ACCEPT_ATTRIBUTES.document).toContain('application/pdf');
    expect(ACCEPT_ATTRIBUTES.document).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(ACCEPT_ATTRIBUTES.document).not.toContain('.xlsx');
    expect(ACCEPT_ATTRIBUTES.document).not.toContain('.xls');
  });

  it('approves PDF, Word, and PowerPoint files for document category', () => {
    const pdfFile = new File(['content'], 'manual.pdf', { type: 'application/pdf' });
    const docxFile = new File(['content'], 'guide.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const docFile = new File(['content'], 'notes.doc', { type: 'application/msword' });
    const pptxFile = new File(['content'], 'slides.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    const pptFile = new File(['content'], 'deck.ppt', {
      type: 'application/vnd.ms-powerpoint',
    });

    expect(validateFile(pdfFile, 'document')).toEqual({ valid: true });
    expect(validateFile(docxFile, 'document')).toEqual({ valid: true });
    expect(validateFile(docFile, 'document')).toEqual({ valid: true });
    expect(validateFile(pptxFile, 'document')).toEqual({ valid: true });
    expect(validateFile(pptFile, 'document')).toEqual({ valid: true });
  });

  it('rejects spreadsheet files (.xlsx, .xls) for document category', () => {
    const xlsxFile = new File(['content'], 'sheet.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const xlsFile = new File(['content'], 'sheet.xls', {
      type: 'application/vnd.ms-excel',
    });

    const xlsxResult = validateFile(xlsxFile, 'document');
    expect(xlsxResult.valid).toBe(false);
    expect(xlsxResult.error).toContain('Document lessons only accept:');
    expect(xlsxResult.error).toContain('.pdf, .doc, .docx, .ppt, .pptx');

    const xlsResult = validateFile(xlsFile, 'document');
    expect(xlsResult.valid).toBe(false);
    expect(xlsResult.error).toContain('Document lessons only accept:');
  });

  it('allows PDF, Word, PowerPoint, Excel, CSV, and ZIP for resource category', () => {
    expect(ALLOWED_EXTENSIONS.resource).toContain('.pdf');
    expect(ALLOWED_EXTENSIONS.resource).toContain('.docx');
    expect(ALLOWED_EXTENSIONS.resource).toContain('.pptx');
    expect(ALLOWED_EXTENSIONS.resource).toContain('.xlsx');
    expect(ALLOWED_EXTENSIONS.resource).toContain('.csv');
    expect(ALLOWED_EXTENSIONS.resource).toContain('.zip');

    const csvFile = new File(['col1,col2'], 'data.csv', { type: 'text/csv' });
    const zipFile = new File(['zip content'], 'bundle.zip', { type: 'application/zip' });
    expect(validateFile(csvFile, 'resource')).toEqual({ valid: true });
    expect(validateFile(zipFile, 'resource')).toEqual({ valid: true });
  });
});
