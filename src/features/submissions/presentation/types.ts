import type { MediaDraftInput, QuizDraftInput } from '@features/content';

export interface EditableLesson {
  id: string;
  title: string;
  kind: number;
  durationSeconds: number;
  displayOrder: number;
  mediaAssetId: string | null;
  externalUrl: string | null;
  quizId: string | null;
  isPreview: boolean;
  media?: MediaDraftInput | null;
  quiz?: QuizDraftInput | null;
  assignmentFiles?: MediaDraftInput[] | null;
}

export interface EditableSection {
  id: string;
  title: string;
  displayOrder: number;
  lessons: EditableLesson[];
}
