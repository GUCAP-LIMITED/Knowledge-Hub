import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  getDraftKey,
  loadDraft,
  clearDraft,
  useUploadDraft,
  type UploadDraft,
} from './use-upload-draft';
import { EMPTY_DETAILS } from './upload-details';

describe('useUploadDraft and storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDraftKey', () => {
    it('scopes by tenant and user when provided', () => {
      expect(getDraftKey('tenant-1', 'user-1')).toBe('uapp:upload-draft:tenant-1:user-1');
    });

    it('falls back to host and anon when tenant or user are missing', () => {
      expect(getDraftKey()).toBe('uapp:upload-draft:host:anon');
      expect(getDraftKey('', null)).toBe('uapp:upload-draft:host:anon');
      expect(getDraftKey(undefined, 'user-99')).toBe('uapp:upload-draft:host:user-99');
    });
  });

  describe('loadDraft and clearDraft', () => {
    it('loads scoped draft from localStorage', () => {
      const key = getDraftKey('t1', 'u1');
      const draft: UploadDraft = {
        contentType: 'course',
        currentStep: 2,
        draftTitle: 'TypeScript In-Depth',
        details: { ...EMPTY_DETAILS, title: 'TypeScript In-Depth' },
        sections: [],
        files: {},
        savedAt: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(draft));

      const loaded = loadDraft(key);
      expect(loaded).not.toBeNull();
      expect(loaded?.draftTitle).toBe('TypeScript In-Depth');
      expect(loaded?.currentStep).toBe(2);
    });

    it('falls back to legacy draft key if scoped key not found', () => {
      const draft: UploadDraft = {
        contentType: 'tutorial',
        currentStep: 1,
        details: { ...EMPTY_DETAILS, title: 'Legacy Tutorial' },
        sections: [],
        files: {},
      };
      localStorage.setItem('uapp:upload-draft', JSON.stringify(draft));

      const loaded = loadDraft('uapp:upload-draft:host:u-new');
      expect(loaded).not.toBeNull();
      expect(loaded?.details.title).toBe('Legacy Tutorial');
    });

    it('clears scoped and legacy keys cleanly', () => {
      const key = getDraftKey('t1', 'u1');
      localStorage.setItem(key, '{"title":"scoped"}');
      localStorage.setItem('uapp:upload-draft', '{"title":"legacy"}');

      clearDraft(key);
      expect(localStorage.getItem(key)).toBeNull();
      expect(localStorage.getItem('uapp:upload-draft')).toBeNull();
    });
  });

  describe('useUploadDraft hook', () => {
    it('autosaves debounced draft with summary and scrubbed files', () => {
      const onRestore = vi.fn();
      const mockFile = new File(['dummy content'], 'video.mp4', { type: 'video/mp4' });

      const initialDraft: UploadDraft = {
        contentType: 'course',
        currentStep: 2,
        details: {
          ...EMPTY_DETAILS,
          title: 'Advanced React Architecture',
          audienceGroups: [
            {
              id: 'grp-1',
              isAllBranches: true,
              branchIds: [],
              accessType: 'public',
              teamIds: [],
            },
          ],
        },
        sections: [
          {
            id: 'sec-1',
            title: 'Getting Started',
            lessons: [
              {
                id: 'les-1',
                title: 'Introduction',
                kind: 'video',
                file: mockFile,
              },
            ],
          },
        ],
        files: {
          thumbnail: [mockFile],
        },
      };

      const { result } = renderHook(() =>
        useUploadDraft({
          draft: initialDraft,
          enabled: true,
          tenantId: 't-test',
          userId: 'u-author',
          onRestore,
        }),
      );

      expect(result.current.status).toBe('saving');

      // Fast-forward debounce timer (800ms)
      act(() => {
        vi.advanceTimersByTime(900);
      });

      expect(result.current.status).toBe('saved');

      const savedKey = getDraftKey('t-test', 'u-author');
      const stored = JSON.parse(localStorage.getItem(savedKey) ?? '{}') as UploadDraft;

      expect(stored.draftTitle).toBe('Advanced React Architecture');
      expect(stored.currentStep).toBe(2);
      expect(stored.summary?.sectionsCount).toBe(1);
      expect(stored.summary?.lessonsCount).toBe(1);
      expect(stored.summary?.audienceCount).toBe(1);
      // Files dictionary is scrubbed to empty object for serializability
      expect(stored.files).toEqual({});
    });

    it('resumes existing draft and notifies onRestore', () => {
      const savedKey = getDraftKey('t-1', 'u-1');
      const existingDraft: UploadDraft = {
        contentType: 'tutorial',
        currentStep: 2,
        draftTitle: 'CSS Grid Guide',
        details: { ...EMPTY_DETAILS, title: 'CSS Grid Guide' },
        sections: [],
        files: {},
        savedAt: 12345678,
      };
      localStorage.setItem(savedKey, JSON.stringify(existingDraft));

      const onRestore = vi.fn();
      const currentDraft: UploadDraft = {
        contentType: null,
        details: EMPTY_DETAILS,
        sections: [],
        files: {},
      };

      const { result } = renderHook(() =>
        useUploadDraft({
          draft: currentDraft,
          enabled: false,
          tenantId: 't-1',
          userId: 'u-1',
          onRestore,
        }),
      );

      expect(result.current.hasDraft).toBe(true);
      expect(result.current.draftInfo?.draftTitle).toBe('CSS Grid Guide');

      act(() => {
        result.current.resume();
      });

      expect(onRestore).toHaveBeenCalledTimes(1);
      expect(onRestore).toHaveBeenCalledWith(
        expect.objectContaining({
          draftTitle: 'CSS Grid Guide',
          currentStep: 2,
        }),
      );
      expect(result.current.hasDraft).toBe(false);
    });

    it('dismisses draft and purges storage', () => {
      const savedKey = getDraftKey('t-1', 'u-1');
      localStorage.setItem(savedKey, '{"draftTitle":"Old Draft"}');

      const onRestore = vi.fn();
      const { result } = renderHook(() =>
        useUploadDraft({
          draft: { contentType: null, details: EMPTY_DETAILS, sections: [], files: {} },
          enabled: false,
          tenantId: 't-1',
          userId: 'u-1',
          onRestore,
        }),
      );

      expect(result.current.hasDraft).toBe(true);

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.hasDraft).toBe(false);
      expect(localStorage.getItem(savedKey)).toBeNull();
    });
  });
});
