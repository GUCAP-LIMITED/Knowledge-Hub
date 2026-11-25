import type { ReactNode } from 'react';
import type {
  ContentDetail,
  ContentDraftStateInput,
  MediaDraftInput,
  QuizDraftInput,
} from '@features/content';

export interface DraftEditorState {
  content: ContentDetail;
  contentId: string;
  contentType: number;
  contentTypeKey: 'course' | 'tutorial' | 'resource';
  canModify: boolean;
  isDraftDirty: boolean;
  isRemoteDraft: boolean;
  isPendingReview: boolean;
  isRejected: boolean;
  reviewerNotes: string | null;
  statusText: string;

  draftState: ContentDraftStateInput;
  setDraftState: (state: ContentDraftStateInput) => void;
  updateDetails: (details: Partial<ContentDraftStateInput['details']>) => void;
  updateTags: (tags: readonly string[]) => void;
  updateCurriculum: (curriculum: ContentDraftStateInput['curriculum']) => void;
  updateMedia: (media: readonly MediaDraftInput[]) => void;
  addDraftMedia: (media: MediaDraftInput) => void;
  removeDraftMedia: (azureBlobNameOrId: string) => void;
  updateQuiz: (quiz: QuizDraftInput | null) => void;

  saveDraft: (draftOverride?: ContentDraftStateInput) => Promise<void>;
  submitDraft: () => Promise<void>;
  isSaving: boolean;
  isSubmitting: boolean;
}

export interface DraftEditorProviderProps {
  readonly content: ContentDetail;
  readonly revisionId?: string | undefined;
  readonly children: ReactNode;
}
