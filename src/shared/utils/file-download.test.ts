import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { getFilenameFromUrl, downloadFile } from './file-download';
import { useFileDownload } from './use-file-download';

describe('getFilenameFromUrl', () => {
  it('extracts filename from clean URL', () => {
    expect(getFilenameFromUrl('https://storage.azure.com/docs/annual-report.pdf')).toBe(
      'annual-report.pdf',
    );
  });

  it('strips query parameters and hash fragments', () => {
    expect(
      getFilenameFromUrl(
        'https://storage.azure.com/docs/slides.pptx?sv=2021-08-06&sig=xyz#viewer',
      ),
    ).toBe('slides.pptx');
  });

  it('decodes URI-encoded characters in filename', () => {
    expect(
      getFilenameFromUrl('https://storage.azure.com/docs/Fatema%27s%20Academic%20CV.pdf'),
    ).toBe("Fatema's Academic CV.pdf");
  });

  it('returns defaultName when URL has no trailing file segment', () => {
    expect(getFilenameFromUrl('https://storage.azure.com/')).toBe('download');
    expect(getFilenameFromUrl('https://storage.azure.com/', 'fallback.bin')).toBe(
      'fallback.bin',
    );
  });
});

describe('downloadFile and useFileDownload', () => {
  let clickedLinks: HTMLAnchorElement[] = [];

  beforeEach(() => {
    clickedLinks = [];

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clickedLinks.push(this);
    });

    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(
      'blob:http://localhost/test-uuid',
    );
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadFile', () => {
    it('throws error for empty URL', async () => {
      await expect(downloadFile('')).rejects.toThrow('A valid URL is required');
    });

    it('downloads directly without fetch if URL is a blob: URL', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const blobUrl = 'blob:http://localhost/existing-blob';

      await downloadFile(blobUrl, 'test.pdf');

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(clickedLinks.length).toBe(1);
      expect(clickedLinks[0]?.href).toBe(blobUrl);
      expect(clickedLinks[0]?.download).toBe('test.pdf');
    });

    it('downloads directly without fetch if URL is a data: URL', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const dataUrl = 'data:text/plain;base64,SGVsbG8=';

      await downloadFile(dataUrl, 'hello.txt');

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(clickedLinks.length).toBe(1);
      expect(clickedLinks[0]?.href).toBe(dataUrl);
      expect(clickedLinks[0]?.download).toBe('hello.txt');
    });

    it('fetches remote URL as blob and triggers same-origin anchor download', async () => {
      const mockBlob = new Blob(['sample content'], { type: 'application/pdf' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(mockBlob, { status: 200, statusText: 'OK' }),
      );

      const remoteUrl = 'https://blob.azure.com/docs/report.pdf?sas=123';
      await downloadFile(remoteUrl, 'Custom Name.pdf');

      expect(globalThis.fetch).toHaveBeenCalledWith(remoteUrl);
      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickedLinks.length).toBe(1);
      expect(clickedLinks[0]?.href).toBe('blob:http://localhost/test-uuid');
      expect(clickedLinks[0]?.download).toBe('Custom Name.pdf');
    });

    it('falls back to direct anchor and throws when fetch fails (e.g. CORS)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      const remoteUrl = 'https://cors-blocked-domain.com/doc.pdf';
      await expect(downloadFile(remoteUrl, 'doc.pdf')).rejects.toThrow('Failed to fetch');

      expect(clickedLinks.length).toBe(1);
      expect(clickedLinks[0]?.href).toBe(remoteUrl);
      expect(clickedLinks[0]?.download).toBe('doc.pdf');
      expect(clickedLinks[0]?.target).toBe('_blank');
    });
  });

  describe('useFileDownload', () => {
    it('manages download state and returns true on success', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(new Blob(['hello']), { status: 200 }),
      );

      const { result } = renderHook(() => useFileDownload());

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBeNull();

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.download(
          'https://example.com/file.pdf',
          'file.pdf',
        );
      });

      expect(success).toBe(true);
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('captures error and returns false on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useFileDownload());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.download(
          'https://example.com/file.pdf',
          'file.pdf',
        );
      });

      expect(success).toBe(false);
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error?.message).toBe('Network error');
    });
  });
});
