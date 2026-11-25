/* eslint-disable max-lines, max-lines-per-function */
import { useState, type Dispatch, type SetStateAction } from 'react';
import { formatDuration } from '@shared/utils';
import { useAuth } from '@features/auth';
import {
  useUploadContent,
  type UploadWizardInput,
  type ExternalVideoUrlInput,
} from '@features/content';
import { measureVideoDuration } from '@features/tutorials';
import { usePublishesDirectly } from './use-publishes-directly';
import { submitOutcome, type SubmitOutcome } from './upload-submit-outcome';
import type { CreatedContent } from './upload-result-link';
import { type Details, EMPTY_DETAILS, missingRequired } from './upload-details';
import { missingStudio } from './curriculum-validation';
import {
  type UseUploadDraftResult,
  type UploadDraft,
  clearDraft,
  getDraftKey,
  useUploadDraft,
} from './use-upload-draft';
import {
  type ContentTypeKey,
  type QuizConfig,
  type Section,
  type SlotFiles,
  type StepKey,
  type UploadSlot,
  type VideoPlaylistItem,
  missingQuiz,
  requiredSlotsFilled,
  slotsFor,
  stepsFor,
  typeLabel,
} from './upload-content-types';

export interface UploadFlow extends SubmitOutcome {
  /** True when the user may publish directly (skips review) — drives the wizard's publish messaging. */
  readonly publishesDirectly: boolean;
  readonly done: boolean;
  readonly created: CreatedContent | null;
  readonly attempt: number;
  readonly steps: readonly StepKey[];
  readonly current: number;
  readonly contentType: ContentTypeKey | null;
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly quiz: QuizConfig | null;
  readonly missing: readonly string[];
  readonly author: string;
  readonly draft: UseUploadDraftResult;
  readonly isSubmitting: boolean;
  readonly videoPlaylist: readonly VideoPlaylistItem[];
  readonly setVideoPlaylist: (playlist: readonly VideoPlaylistItem[]) => void;
  readonly setFiles: (files: SlotFiles) => void;
  readonly setSections: (sections: readonly Section[]) => void;
  readonly setQuiz: (quiz: QuizConfig | null) => void;
  readonly chooseType: (key: ContentTypeKey) => void;
  readonly submitDetails: (details: Details) => void;
  readonly back: () => void;
  readonly next: () => void;
  readonly publish: () => void;
  readonly reset: () => void;
}

interface FlowState {
  readonly contentType: ContentTypeKey | null;
  readonly current: number;
  readonly files: SlotFiles;
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly quiz: QuizConfig | null;
  readonly videoPlaylist: readonly VideoPlaylistItem[];
  readonly done: boolean;
  readonly created: CreatedContent | null;
  readonly attempt: number;
}

interface FlowSetters {
  readonly setContentType: (value: ContentTypeKey | null) => void;
  readonly setCurrent: (value: number) => void;
  readonly setFiles: (value: SlotFiles) => void;
  readonly setVideoPlaylist: (value: readonly VideoPlaylistItem[]) => void;
  readonly setDetails: Dispatch<SetStateAction<Details>>;
  readonly setSections: (value: readonly Section[]) => void;
  readonly setQuiz: (value: QuizConfig | null) => void;
  readonly setDone: (value: boolean) => void;
  readonly setCreated: (value: CreatedContent | null) => void;
  readonly setAttempt: (value: number) => void;
}

const useFlowState = (): FlowState & FlowSetters => {
  const [contentType, setContentType] = useState<ContentTypeKey | null>(null);
  const [current, setCurrent] = useState(0);
  const [files, setFiles] = useState<SlotFiles>({});
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [sections, setSections] = useState<readonly Section[]>([]);
  const [quiz, setQuiz] = useState<QuizConfig | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<readonly VideoPlaylistItem[]>([]);
  const [done, setDone] = useState(false);
  const [created, setCreated] = useState<CreatedContent | null>(null);
  const [attempt, setAttempt] = useState(0);
  return {
    contentType,
    current,
    files,
    details,
    sections,
    quiz,
    videoPlaylist,
    done,
    created,
    attempt,
    setContentType,
    setCurrent,
    setFiles,
    setVideoPlaylist,
    setDetails,
    setSections,
    setQuiz,
    setDone,
    setCreated,
    setAttempt,
  };
};

const toWizardDetails = (d: Details): UploadWizardInput['details'] => {
  let resolvedVisibility = d.visibility;
  if (resolvedVisibility !== 'private') {
    const hasTeams = d.audienceGroups.some((g) => g.accessType === 'teams');
    resolvedVisibility = hasTeams ? 'team' : 'public';
  }

  return {
    title: d.title,
    subtitle: d.subtitle,
    description: d.description,
    categoryId: d.category, // the RHForm `category` field holds the category id
    branchIds: d.branches,
    teamIds: d.teams,
    topic: d.topic,
    difficulty: d.difficulty,
    language: d.language,
    duration: d.duration,
    visibility: resolvedVisibility,
    keywords: d.keywords,
    tags: d.tags,
    thumbnailAlt: d.thumbnailAlt,
  };
};

const toWizardSections = (sections: readonly Section[]): UploadWizardInput['sections'] =>
  sections.map((section, sIdx) => ({
    title: section.title,
    displayOrder: section.displayOrder ?? sIdx,
    lessons: section.lessons.map((lesson, lIdx) => ({
      title: lesson.title,
      kind: lesson.kind,
      displayOrder: lesson.displayOrder ?? lIdx,
      file: lesson.file,
      assignmentLocalFiles: lesson.assignmentLocalFiles,
      quiz: lesson.quiz,
      externalUrl: lesson.externalUrl,
    })),
  }));

const resetFlow = (s: FlowSetters, userId?: string | null): void => {
  clearDraft(getDraftKey(undefined, userId));
  s.setDone(false);
  s.setCreated(null);
  s.setAttempt(0);
  s.setContentType(null);
  s.setCurrent(0);
  s.setFiles({});
  s.setVideoPlaylist([]);
  s.setDetails(EMPTY_DETAILS);
  s.setSections([]);
  s.setQuiz(null);
};

const handleDraftRestore = (s: FlowSetters, d: UploadDraft): void => {
  s.setContentType(d.contentType);
  s.setDetails(d.details);
  s.setQuiz(d.quiz ?? null);
  if (d.videoPlaylist) {
    s.setVideoPlaylist(
      d.videoPlaylist.map((item) => ({
        ...item,
        file: undefined,
      })),
    );
  } else {
    s.setVideoPlaylist([]);
  }

  const scrubbedSections = d.sections.map((sec) => ({
    ...sec,
    lessons: sec.lessons.map((les) => {
      const { file: _file, ...rest } = les;
      return rest;
    }),
  }));
  s.setSections(scrubbedSections);

  s.setFiles({}); // files aren't persisted — the user re-attaches after resuming
  const maxStep = stepsFor(d.contentType).length - 1;
  const targetStep = Math.min(Math.max(d.currentStep ?? 1, 0), Math.max(maxStep, 0));
  s.setCurrent(targetStep);
};

const runUpload = (
  upload: ReturnType<typeof useUploadContent>,
  s: FlowState & FlowSetters,
  userId: string | null | undefined,
): void => {
  if (s.contentType === null) {
    return;
  }

  let resolvedFiles = s.files;
  let externalVideoUrls: ExternalVideoUrlInput[] | undefined = undefined;

  if (s.contentType === 'tutorial') {
    const playlistFiles = s.videoPlaylist.flatMap((v) => {
      if (!v.file) return [];
      if (v.name && v.name !== v.file.name) {
        return [new File([v.file], v.name, { type: v.file.type })];
      }
      return [v.file];
    });
    resolvedFiles = {
      ...s.files,
      primary: playlistFiles,
    };
    const externalItems = s.videoPlaylist.filter(
      (v): v is typeof v & { readonly externalUrl: string } =>
        typeof v.externalUrl === 'string' && v.externalUrl.length > 0,
    );
    if (externalItems.length > 0) {
      externalVideoUrls = externalItems.map((v) => ({
        url: v.externalUrl,
        name: v.name,
        displayOrder: v.displayOrder,
      }));
    }
  }

  upload.mutate(
    {
      contentType: s.contentType,
      details: toWizardDetails(s.details),
      files: resolvedFiles,
      externalVideoUrls,
      sections: toWizardSections(s.sections),
      quiz: s.quiz,
    },
    {
      onSuccess: (result) => {
        clearDraft(getDraftKey(undefined, userId));
        s.setCreated({ id: result.id, type: result.type });
        s.setDone(true);
      },
    },
  );
};

const missingTutorialRequirements = (
  files: FlowState['files'],
  quiz: FlowState['quiz'],
  videoPlaylist: readonly VideoPlaylistItem[],
): readonly string[] => {
  const missing: string[] = [];
  if ((files.thumbnail?.length ?? 0) === 0) missing.push('Tutorial thumbnail');
  const hasVideo =
    videoPlaylist.some((v) => v.file !== undefined || Boolean(v.externalUrl)) ||
    (files.primary?.length ?? 0) > 0;
  if (!hasVideo) missing.push('Tutorial video');
  if (quiz && quiz.questions.length > 0)
    missing.push(...missingQuiz(quiz, 'Tutorial quiz'));
  return missing;
};

/** Labels of the resource slots (thumbnail, reference files) that still have no file. */
const missingResourceRequirements = (files: FlowState['files']): readonly string[] =>
  slotsFor('resource')
    .filter((slot) => slot.required === true && (files[slot.id]?.length ?? 0) === 0)
    .map((slot) => slot.label);

/** What the wizard still needs, derived from the flow state. */
const deriveRequirements = (
  s: FlowState,
): { fileReady: boolean; missing: readonly string[] } => {
  const isSlotReady = requiredSlotsFilled(s.contentType, s.files);
  const isTutorialVideoReady =
    s.contentType !== 'tutorial' ||
    s.videoPlaylist.some((v) => v.file !== undefined || Boolean(v.externalUrl)) ||
    (s.files.primary?.length ?? 0) > 0;
  return {
    fileReady: isSlotReady && isTutorialVideoReady,
    missing: [
      ...missingRequired(s.details),
      ...(s.contentType === 'course' ? missingStudio(s.files, s.sections) : []),
      ...(s.contentType === 'tutorial'
        ? missingTutorialRequirements(s.files, s.quiz, s.videoPlaylist)
        : []),
      ...(s.contentType === 'resource' ? missingResourceRequirements(s.files) : []),
    ],
  };
};

/** All state and transitions for the upload wizard, kept out of the view component. */
export const useUploadFlow = (): UploadFlow => {
  const { user } = useAuth();
  const upload = useUploadContent();
  const publishesDirectly = usePublishesDirectly();
  const author = user?.fullName ?? 'You';
  const s = useFlowState();
  const { contentType, current, files, details, sections, quiz, done, created, attempt } =
    s;
  const steps = stepsFor(contentType);
  const { fileReady, missing } = deriveRequirements(s);

  // A click that can't proceed reveals the required-field markers instead of doing nothing.
  const blockAttempt = (): void => {
    s.setAttempt(attempt + 1);
  };
  const goToStep = (step: number): void => {
    s.setAttempt(0);
    s.setCurrent(step);
  };

  const reset = (): void => {
    resetFlow(s, user?.id);
  };

  const draft = useUploadDraft({
    draft: {
      contentType,
      currentStep: current,
      details,
      sections,
      files,
      videoPlaylist: s.videoPlaylist,
      quiz,
    },
    enabled: contentType !== null && !done,
    userId: user?.id,
    onRestore: (d) => {
      handleDraftRestore(s, d);
    },
  });

  return {
    publishesDirectly,
    done,
    created,
    attempt,
    steps,
    current,
    contentType,
    slots: slotsFor(contentType),
    files,
    details,
    sections,
    quiz,
    videoPlaylist: s.videoPlaylist,
    missing,
    author,
    draft,
    ...submitOutcome(upload.error),
    isSubmitting: upload.isPending,
    setVideoPlaylist: (nextPlaylist: readonly VideoPlaylistItem[]) => {
      s.setVideoPlaylist(nextPlaylist);
      if (s.contentType === 'tutorial') {
        const filesWithDuration = nextPlaylist.flatMap((item) =>
          item.file ? [item.file] : [],
        );
        if (filesWithDuration.length > 0) {
          void Promise.all(filesWithDuration.map((f) => measureVideoDuration(f))).then(
            (durations) => {
              const totalSeconds = durations.reduce((acc, curr) => acc + curr, 0);
              if (totalSeconds > 0) {
                const formatted =
                  formatDuration(totalSeconds) ||
                  `${String(Math.round(totalSeconds / 60))}m`;
                s.setDetails((prev) => ({
                  ...prev,
                  duration: formatted,
                }));
              }
            },
          );
        }
      }
    },
    setFiles: (nextFiles: SlotFiles) => {
      s.setFiles(nextFiles);
      if (
        contentType === 'tutorial' &&
        nextFiles.primary &&
        nextFiles.primary.length > 0
      ) {
        void Promise.all(
          nextFiles.primary.map((file) => measureVideoDuration(file)),
        ).then((durations) => {
          const totalSeconds = durations.reduce((acc, curr) => acc + curr, 0);
          if (totalSeconds > 0) {
            const formatted =
              formatDuration(totalSeconds) || `${String(Math.round(totalSeconds / 60))}m`;
            s.setDetails((prev) => ({
              ...prev,
              duration: formatted,
            }));
          }
        });
      }
    },
    setSections: s.setSections,
    setQuiz: s.setQuiz,
    chooseType: (key) => {
      // Select only — the user advances explicitly via the Continue action bar.
      s.setContentType(key);
      s.setDetails({ ...details, type: typeLabel(key) });
    },
    submitDetails: (next) => {
      s.setDetails({ ...next, type: typeLabel(contentType) });
      goToStep(current + 1);
    },
    back: () => {
      goToStep(current - 1);
    },
    next: () => {
      if (steps[current] === 'file' && !fileReady) {
        blockAttempt();
        return;
      }
      goToStep(current + 1);
    },
    publish: () => {
      if (missing.length > 0) {
        blockAttempt();
        return;
      }
      runUpload(upload, s, user?.id);
    },
    reset,
  };
};
