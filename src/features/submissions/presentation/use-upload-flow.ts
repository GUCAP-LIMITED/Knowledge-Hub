import { useState } from 'react';
import { useAuth } from '@features/auth';
import { useSubmitContent } from './use-submissions';
import { type Details, EMPTY_DETAILS, missingRequired } from './upload-details';
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

/** All state and transitions for the upload wizard, kept out of the view component. */
export const useUploadFlow = (): UploadFlow => {
  const { user } = useAuth();
  const submit = useSubmitContent();
  const isAdmin = user?.hasRole('admin') ?? false;

  const [contentType, setContentType] = useState<ContentTypeKey | null>(null);
  const [current, setCurrent] = useState(0);
  const [files, setFiles] = useState<SlotFiles>({});
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [sections, setSections] = useState<readonly Section[]>([]);
  const [done, setDone] = useState(false);

  const reset = (): void => {
    setDone(false);
    setContentType(null);
    setCurrent(0);
    setFiles({});
    setDetails(EMPTY_DETAILS);
    setSections([]);
  };

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
    author: user?.fullName ?? 'You',
    submitError: submit.isError ? submit.error.message : undefined,
    isSubmitting: submit.isPending,
    setFiles,
    setSections,
    chooseType: (key) => {
      setContentType(key);
      setDetails((prev) => ({ ...prev, type: typeLabel(key) }));
      setCurrent(1);
    },
    submitDetails: (next) => {
      setDetails({ ...next, type: typeLabel(contentType) });
      setCurrent(current + 1);
    },
    back: () => {
      setCurrent(current - 1);
    },
    next: () => {
      setCurrent(current + 1);
    },
    publish: () => {
      submit.mutate(
        {
          title: details.title,
          type: details.type,
          submittedBy: user?.fullName ?? 'You',
          publishDirectly: isAdmin,
        },
        {
          onSuccess: () => {
            setDone(true);
          },
        },
      );
    },
    reset,
  };
};
