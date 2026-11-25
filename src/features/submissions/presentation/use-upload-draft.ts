/* eslint-disable max-lines-per-function */
import { useEffect, useState, useMemo } from 'react';
import type {
  ContentTypeKey,
  QuizConfig,
  Section,
  SlotFiles,
  VideoPlaylistItem,
} from './upload-content-types';
import type { Details } from './upload-details';

export type SaveStatus = 'idle' | 'saving' | 'saved';

export interface DraftSummary {
  readonly sectionsCount: number;
  readonly lessonsCount: number;
  readonly audienceCount: number;
}

/** A serializable snapshot of an in-progress upload, cached in localStorage. */
export interface UploadDraft {
  readonly contentType: ContentTypeKey | null;
  readonly currentStep?: number | undefined;
  readonly draftTitle?: string | undefined;
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly files: SlotFiles;
  readonly videoPlaylist?: readonly Omit<VideoPlaylistItem, 'file'>[] | undefined;
  readonly quiz?: QuizConfig | null | undefined;
  readonly summary?: DraftSummary | undefined;
  /** Epoch ms of the last autosave — used to show "last saved …" in the resume banner. */
  readonly savedAt?: number | undefined;
}

const LEGACY_DRAFT_KEY = 'uapp:upload-draft';

export const getDraftKey = (tenantId?: string | null, userId?: string | null): string => {
  const t = tenantId && tenantId.trim().length > 0 ? tenantId.trim() : 'host';
  const u = userId && userId.trim().length > 0 ? userId.trim() : 'anon';
  return `uapp:upload-draft:${t}:${u}`;
};

export const loadDraft = (key: string = LEGACY_DRAFT_KEY): UploadDraft | null => {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw) as UploadDraft;
    }
    if (key !== LEGACY_DRAFT_KEY) {
      const legacyRaw = localStorage.getItem(LEGACY_DRAFT_KEY);
      if (legacyRaw !== null) {
        return JSON.parse(legacyRaw) as UploadDraft;
      }
    }
    return null;
  } catch {
    return null;
  }
};

export const clearDraft = (key: string = LEGACY_DRAFT_KEY): void => {
  try {
    localStorage.removeItem(key);
    if (key !== LEGACY_DRAFT_KEY) {
      localStorage.removeItem(LEGACY_DRAFT_KEY);
    }
  } catch {
    /* private mode / quota — nothing cached to clear */
  }
};

export interface UseUploadDraftResult {
  readonly status: SaveStatus;
  readonly hasDraft: boolean;
  readonly draftInfo: UploadDraft | null;
  /** Epoch ms the cached draft was last saved, or null when there is none. */
  readonly savedAt: number | null;
  readonly resume: () => void;
  readonly dismiss: () => void;
}

const buildDraftSummary = (
  sections: readonly Section[],
  details: Details,
): DraftSummary => {
  const sectionsCount = sections.length;
  const lessonsCount = sections.reduce((acc, sec) => acc + sec.lessons.length, 0);
  const audienceCount = details.audienceGroups.length;

  return { sectionsCount, lessonsCount, audienceCount };
};

/** Debounced autosave of the draft to localStorage, plus resume/dismiss of a prior draft. */
export const useUploadDraft = (params: {
  readonly draft: UploadDraft;
  readonly enabled: boolean;
  readonly tenantId?: string | null | undefined;
  readonly userId?: string | null | undefined;
  readonly onRestore: (draft: UploadDraft) => void;
}): UseUploadDraftResult => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const storageKey = useMemo(
    () => getDraftKey(params.tenantId, params.userId),
    [params.tenantId, params.userId],
  );

  const initialDraft = useMemo(() => loadDraft(storageKey), [storageKey]);
  const [hasDraft, setHasDraft] = useState<boolean>(() => initialDraft !== null);
  const [draftInfo, setDraftInfo] = useState<UploadDraft | null>(() => initialDraft);

  const serialized = JSON.stringify(params.draft);

  useEffect(() => {
    if (!params.enabled) {
      return;
    }
    setStatus('saving');
    const id = setTimeout(() => {
      try {
        const snapshot = JSON.parse(serialized) as UploadDraft;
        const summary = buildDraftSummary(snapshot.sections, snapshot.details);
        const draftTitle =
          snapshot.details.title.trim().length > 0
            ? snapshot.details.title.trim()
            : undefined;

        // Files are real File objects (not serializable) — persist metadata only;
        // user re-attaches files if they resume a draft.
        const serializablePlaylist = snapshot.videoPlaylist?.map((v) => ({
          clientId: v.clientId,
          name: v.name,
          sizeBytes: v.sizeBytes,
          externalUrl: v.externalUrl,
          displayOrder: v.displayOrder,
        }));
        const payload: UploadDraft = {
          ...snapshot,
          draftTitle,
          summary,
          files: {},
          videoPlaylist: serializablePlaylist,
          savedAt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setDraftInfo(payload);
      } catch {
        /* private mode / quota — draft simply isn't cached */
      }
      setStatus('saved');
    }, 800);

    return () => {
      clearTimeout(id);
    };
  }, [serialized, storageKey, params.enabled]);

  // Protect against tab exit while saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (status === 'saving') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status]);

  return {
    status,
    hasDraft,
    draftInfo,
    savedAt: draftInfo?.savedAt ?? null,
    resume: () => {
      const draft = loadDraft(storageKey);
      if (draft !== null) {
        params.onRestore(draft);
      }
      setHasDraft(false);
      setDraftInfo(null);
    },
    dismiss: () => {
      clearDraft(storageKey);
      setHasDraft(false);
      setDraftInfo(null);
    },
  };
};
