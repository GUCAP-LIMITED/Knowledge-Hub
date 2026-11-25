import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourceFileTypeIcon, ResourceFormatBadge } from './ResourceFileTypeIcon';
import { resolveResourceCategory } from './resource-file-types';

describe('ResourceFileTypeIcon category resolver', () => {
  it('correctly categorizes PDF files', () => {
    const meta = resolveResourceCategory("Fatema's Academic CV.pdf");
    expect(meta.key).toBe('pdf');
    expect(meta.badgeText).toBe('PDF');
    expect(meta.label).toBe('Adobe PDF Document');
  });

  it('correctly categorizes Word documents', () => {
    const docxMeta = resolveResourceCategory('Proposal.docx');
    expect(docxMeta.key).toBe('word');
    expect(docxMeta.badgeText).toBe('DOCX');

    const docMeta = resolveResourceCategory('OldNotes.doc');
    expect(docMeta.key).toBe('word');
    expect(docMeta.badgeText).toBe('DOC');
  });

  it('correctly categorizes Excel and CSV spreadsheets', () => {
    const xlsxMeta = resolveResourceCategory('Financials.xlsx');
    expect(xlsxMeta.key).toBe('excel');
    expect(xlsxMeta.badgeText).toBe('XLSX');

    const xlsMeta = resolveResourceCategory('Sheet.xls');
    expect(xlsMeta.key).toBe('excel');
    expect(xlsMeta.badgeText).toBe('XLS');

    const csvMeta = resolveResourceCategory('DataExport.csv');
    expect(csvMeta.key).toBe('excel');
    expect(csvMeta.badgeText).toBe('CSV');
  });

  it('correctly categorizes PowerPoint presentations', () => {
    const pptxMeta = resolveResourceCategory('PitchDeck.pptx');
    expect(pptxMeta.key).toBe('powerpoint');
    expect(pptxMeta.badgeText).toBe('PPTX');

    const pptMeta = resolveResourceCategory('Slides.ppt');
    expect(pptMeta.key).toBe('powerpoint');
    expect(pptMeta.badgeText).toBe('PPT');
  });

  it('correctly categorizes compressed ZIP and archive files', () => {
    const zipMeta = resolveResourceCategory('ResourcePack.zip');
    expect(zipMeta.key).toBe('archive');
    expect(zipMeta.badgeText).toBe('ZIP');

    const rarMeta = resolveResourceCategory('SourceFiles.rar');
    expect(rarMeta.key).toBe('archive');
    expect(rarMeta.badgeText).toBe('RAR');
  });

  it('handles MIME type detection when file extension is absent or ambiguous', () => {
    const pdfByMime = resolveResourceCategory('download', 'application/pdf');
    expect(pdfByMime.key).toBe('pdf');

    const csvByMime = resolveResourceCategory('export', 'text/csv');
    expect(csvByMime.key).toBe('excel');
  });
});

describe('<ResourceFileTypeIcon /> rendering', () => {
  it('renders with appropriate accessibility label and title', () => {
    render(<ResourceFileTypeIcon fileName="Fatema's Academic CV.pdf" />);
    const iconTile = screen.getByLabelText('Adobe PDF Document');
    expect(iconTile).toBeInTheDocument();
    expect(iconTile).toHaveAttribute('title', 'Adobe PDF Document');
  });

  it('renders format badge pill with correct text', () => {
    render(<ResourceFormatBadge fileName="Fatema's Academic CV.pdf" />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });
});
