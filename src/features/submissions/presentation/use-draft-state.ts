import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  getContentTypeKey,
  useGetActiveRevision,
  useGetRevision,
  useSaveRevision,
  useSubmitRevision,
  MEDIA_SLOT,
  type ContentDetail,
  type ContentDraftStateInput,
  type MediaDraftInput,
  type QuizDraftInput,
} from '@features/content';
import { savePlaylistOrder } from '@features/tutorials';
import { sanitizeCurriculum, sanitizeQuiz } from './draft-editor-sanitizer';
import { createInitialDraftState, resolveRevisionStatus } from './draft-editor-hydrator';
import type { DraftEditorState } from './draft-editor-types';
import { validateDraftForSubmit } from './draft-editor-validation';

interface DraftFormActions {
  updateDetails: (details: Partial<ContentDraftStateInput['details']>) => void;
  updateTags: (tags: readonly string[]) => void;
  updateCurriculum: (curriculum: ContentDraftStateInput['curriculum']) => void;
  updateMedia: (media: readonly MediaDraftInput[]) => void;
  addDraftMedia: (media: MediaDraftInput) => void;
  removeDraftMedia: (azureBlobNameOrId: string) => void;
  updateQuiz: (quiz: QuizDraftInput | null) => void;
}

const useDraftFormActions = (
  setLocalDraft: Dispatch<SetStateAction<ContentDraftStateInput>>,
  setIsDraftDirty: Dispatch<SetStateAction<boolean>>,
): DraftFormActions => {
  const updateDetails = useCallback(
    (details: Partial<ContentDraftStateInput['details']>) => {
      setLocalDraft((prev) => ({
        ...prev,
        details: { ...prev.details, ...details },
      }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  const updateTags = useCallback(
    (tags: readonly string[]) => {
      setLocalDraft((prev) => ({ ...prev, tags }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  const updateCurriculum = useCallback(
    (curriculum: ContentDraftStateInput['curriculum']) => {
      setLocalDraft((prev) => ({
        ...prev,
        curriculum: sanitizeCurriculum(curriculum),
      }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  const updateMedia = useCallback(
    (media: readonly MediaDraftInput[]) => {
      setLocalDraft((prev) => ({ ...prev, media }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  const addDraftMedia = useCallback(
    (mediaItem: MediaDraftInput) => {
      setLocalDraft((prev) => ({
        ...prev,
        media: [...(prev.media ?? []), mediaItem],
      }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  const removeDraftMedia = useCallback(
    (azureBlobNameOrId: string) => {
      setLocalDraft((prev) => ({
        ...prev,
        media: (prev.media ?? []).filter(
          (m) => m.azureBlobName !== azureBlobNameOrId && m.id !== azureBlobNameOrId,
        ),
      }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  const updateQuiz = useCallback(
    (quiz: QuizDraftInput | null) => {
      setLocalDraft((prev) => ({
        ...prev,
        quiz: sanitizeQuiz(quiz),
      }));
      setIsDraftDirty(true);
    },
    [setLocalDraft, setIsDraftDirty],
  );

  return {
    updateDetails,
    updateTags,
    updateCurriculum,
    updateMedia,
    addDraftMedia,
    removeDraftMedia,
    updateQuiz,
  };
};

interface DraftMutations {
  saveDraft: () => Promise<void>;
  submitDraft: () => Promise<void>;
  isSaving: boolean;
  isSubmitting: boolean;
}

const persistTutorialMediaOrder = (
  contentId: string,
  media: readonly MediaDraftInput[] | undefined,
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): void => {
  if (contentTypeKey !== 'tutorial' || !media || !contentId) return;
  const orderedIds: string[] = [];
  for (const m of media) {
    if (m.slot !== MEDIA_SLOT.thumbnail && typeof m.id === 'string' && m.id.length > 0) {
      orderedIds.push(m.id);
    }
  }
  if (orderedIds.length > 0) {
    savePlaylistOrder(contentId, orderedIds);
  }
};

const useDraftMutations = (
  contentId: string,
  localDraft: ContentDraftStateInput,
  setIsDraftDirty: Dispatch<SetStateAction<boolean>>,
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): DraftMutations => {
  const saveMutation = useSaveRevision(contentId);
  const submitMutation = useSubmitRevision(contentId);

  const saveDraft = useCallback(
    async (draftOverride?: ContentDraftStateInput): Promise<void> => {
      const payload = draftOverride ?? localDraft;
      persistTutorialMediaOrder(contentId, payload.media, contentTypeKey);
      await saveMutation.mutateAsync(payload);
      setIsDraftDirty(false);
    },
    [saveMutation, localDraft, setIsDraftDirty, contentId, contentTypeKey],
  );

  const submitDraft = useCallback(async (): Promise<void> => {
    const errorMsg = validateDraftForSubmit(localDraft, contentTypeKey);
    if (errorMsg) {
      throw new Error(errorMsg);
    }
    persistTutorialMediaOrder(contentId, localDraft.media, contentTypeKey);
    await saveDraft();
    await submitMutation.mutateAsync();
  }, [saveDraft, submitMutation, localDraft, contentTypeKey, contentId]);

  return {
    saveDraft,
    submitDraft,
    isSaving: saveMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
};

export const useDraftState = (
  content: ContentDetail,
  revisionId: string | undefined,
): DraftEditorState => {
  const { data: activeRevisionData } = useGetActiveRevision(content.id, {
    enabled: !revisionId,
  });
  const { data: specificRevisionData } = useGetRevision(revisionId ?? '', {
    enabled: Boolean(revisionId),
  });

  const activeRevision = revisionId ? specificRevisionData : activeRevisionData;
  const contentTypeKey = getContentTypeKey(content.type);

  const initialDraftState = useMemo<ContentDraftStateInput>(
    () => createInitialDraftState(content, activeRevision, contentTypeKey),
    [content, activeRevision, contentTypeKey],
  );

  const [localDraft, setLocalDraft] = useState<ContentDraftStateInput>(initialDraftState);
  const [isDraftDirty, setIsDraftDirty] = useState(false);

  useEffect(() => {
    setLocalDraft(initialDraftState);
    setIsDraftDirty(false);
  }, [initialDraftState]);

  const formActions = useDraftFormActions(setLocalDraft, setIsDraftDirty);
  const mutations = useDraftMutations(
    content.id,
    localDraft,
    setIsDraftDirty,
    contentTypeKey,
  );
  const statusInfo = resolveRevisionStatus(content, activeRevision);

  return {
    content,
    contentId: content.id,
    contentType: content.type,
    contentTypeKey,
    canModify: content.canModify ?? false,
    ...statusInfo,
    isDraftDirty,
    draftState: localDraft,
    setDraftState: (state) => {
      setLocalDraft(state);
      setIsDraftDirty(true);
    },
    ...formActions,
    ...mutations,
  };
};
