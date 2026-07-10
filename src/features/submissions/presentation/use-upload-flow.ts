import { useState } from 'react';
import { useAuth } from '@features/auth';
import { useSubmitContent } from './use-submissions';
import { type Details, EMPTY_DETAILS, missingRequired } from './upload-details';
import {
  type UseUploadDraftResult,
  clearDraft,
  useUploadDraft,
} from './use-upload-draft';
import {
  type ContentTypeKey,
  type Section,
  type SlotFiles,
  type StepKey,
  type UploadSlot,
  requiredSlotsFilled,
  slotsFor,
  stepsFor,
  typeLabel,
} from './upload-content-types';

export interface UploadFlow {
  readonly isAdmin: boolean;
  readonly done: boolean;
  readonly steps: readonly StepKey[];
  readonly current: number;
  readonly contentType: ContentTypeKey | null;
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly fileReady: boolean;
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly missing: readonly string[];
  readonly author: string;
  readonly draft: UseUploadDraftResult;
  readonly submitError: string | undefined;
  readonly isSubmitting: boolean;
  readonly setFiles: (files: SlotFiles) => void;
  readonly setSections: (sections: readonly Section[]) => void;
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
  readonly done: boolean;
}

interface FlowSetters {
  readonly setContentType: (value: ContentTypeKey | null) => void;
  readonly setCurrent: (value: number) => void;
  readonly setFiles: (value: SlotFiles) => void;
  readonly setDetails: (value: Details) => void;
  readonly setSections: (value: readonly Section[]) => void;
  readonly setDone: (value: boolean) => void;
}

const useFlowState = (): FlowState & FlowSetters => {
  const [contentType, setContentType] = useState<ContentTypeKey | null>(null);
  const [current, setCurrent] = useState(0);
  const [files, setFiles] = useState<SlotFiles>({});
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [sections, setSections] = useState<readonly Section[]>([]);
  const [done, setDone] = useState(false);
  return {
    contentType,
    current,
    files,
    details,
    sections,
    done,
    setContentType,
    setCurrent,
    setFiles,
    setDetails,
    setSections,
    setDone,
  };
};

/** All state and transitions for the upload wizard, kept out of the view component. */
export const useUploadFlow = (): UploadFlow => {
  const { user } = useAuth();
  const submit = useSubmitContent();
  const isAdmin = user?.hasRole('admin') ?? false;
  const author = user?.fullName ?? 'You';
  const s = useFlowState();
  const { contentType, current, files, details, sections, done } = s;

  const reset = (): void => {
    clearDraft();
    s.setDone(false);
    s.setContentType(null);
    s.setCurrent(0);
    s.setFiles({});
    s.setDetails(EMPTY_DETAILS);
    s.setSections([]);
  };

  const draft = useUploadDraft({
    draft: { contentType, details, sections, files },
    enabled: contentType !== null && !done,
    onRestore: (d) => {
      s.setContentType(d.contentType);
      s.setDetails(d.details);
      s.setSections(d.sections);
      s.setFiles(d.files);
      s.setCurrent(1);
    },
  });

  return {
    isAdmin,
    done,
    steps: stepsFor(contentType),
    current,
    contentType,
    slots: slotsFor(contentType),
    files,
    fileReady: requiredSlotsFilled(contentType, files),
    details,
    sections,
    missing: missingRequired(details),
    author,
    draft,
    submitError: submit.isError ? submit.error.message : undefined,
    isSubmitting: submit.isPending,
    setFiles: s.setFiles,
    setSections: s.setSections,
    chooseType: (key) => {
      // Select only — the user advances explicitly via the Continue action bar.
      s.setContentType(key);
      s.setDetails({ ...details, type: typeLabel(key) });
    },
    submitDetails: (next) => {
      s.setDetails({ ...next, type: typeLabel(contentType) });
      s.setCurrent(current + 1);
    },
    back: () => {
      s.setCurrent(current - 1);
    },
    next: () => {
      s.setCurrent(current + 1);
    },
    publish: () => {
      submit.mutate(
        {
          title: details.title,
          type: details.type,
          submittedBy: author,
          publishDirectly: isAdmin,
        },
        {
          onSuccess: () => {
            clearDraft();
            s.setDone(true);
          },
        },
      );
    },
    reset,
  };
};
