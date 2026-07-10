import { useEffect, useState } from 'react';
import type { ContentTypeKey, Section, SlotFiles } from './upload-content-types';
import type { Details } from './upload-details';

export type SaveStatus = 'idle' | 'saving' | 'saved';

/** A serializable snapshot of an in-progress upload, cached in localStorage. */
export interface UploadDraft {
  readonly contentType: ContentTypeKey | null;
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly files: SlotFiles;
  /** Epoch ms of the last autosave — used to show "last saved …" in the resume banner. */
  readonly savedAt?: number;
}

const DRAFT_KEY = 'uapp:upload-draft';

export const loadDraft = (): UploadDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw === null ? null : (JSON.parse(raw) as UploadDraft);
  } catch {
    return null;
  }
};

export const clearDraft = (): void => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private mode / quota — nothing cached to clear */
  }
};

export interface UseUploadDraftResult {
  readonly status: SaveStatus;
  readonly hasDraft: boolean;
  /** Epoch ms the cached draft was last saved, or null when there is none. */
  readonly savedAt: number | null;
  readonly resume: () => void;
  readonly dismiss: () => void;
}

/** Debounced autosave of the draft to localStorage, plus resume/dismiss of a prior draft. */
export const useUploadDraft = (params: {
  readonly draft: UploadDraft;
  readonly enabled: boolean;
  readonly onRestore: (draft: UploadDraft) => void;
}): UseUploadDraftResult => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const initial = useState<UploadDraft | null>(() => loadDraft())[0];
  const [hasDraft, setHasDraft] = useState<boolean>(() => initial !== null);
  const serialized = JSON.stringify(params.draft);

  useEffect(() => {
    if (!params.enabled) {
      return;
    }
    setStatus('saving');
    const id = setTimeout(() => {
      try {
        const snapshot = JSON.parse(serialized) as UploadDraft;
        const payload: UploadDraft = { ...snapshot, savedAt: Date.now() };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      } catch {
        /* private mode / quota — draft simply isn't cached */
      }
      setStatus('saved');
    }, 800);
    return () => {
      clearTimeout(id);
    };
  }, [serialized, params.enabled]);

  return {
    status,
    hasDraft,
    savedAt: initial?.savedAt ?? null,
    resume: () => {
      const draft = loadDraft();
      if (draft !== null) {
        params.onRestore(draft);
      }
      setHasDraft(false);
    },
    dismiss: () => {
      clearDraft();
      setHasDraft(false);
    },
  };
};
