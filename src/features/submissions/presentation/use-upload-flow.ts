import { useState } from 'react';
import { useAuth } from '@features/auth';
import { useSubmitContent } from './use-submissions';
import type { Details, PickedFile } from './UploadSteps';
import {
  type ContentTypeKey,
  type Section,
  type StepKey,
  stepsFor,
  typeLabel,
} from './upload-content-types';

const EMPTY_DETAILS: Details = { title: '', type: '', description: '' };

export interface UploadFlow {
  readonly isAdmin: boolean;
  readonly done: boolean;
  readonly steps: readonly StepKey[];
  readonly current: number;
  readonly contentType: ContentTypeKey | null;
  readonly file: PickedFile | null;
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly submitError: string | undefined;
  readonly isSubmitting: boolean;
  readonly setFile: (file: PickedFile | null) => void;
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
  const [file, setFile] = useState<PickedFile | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [sections, setSections] = useState<readonly Section[]>([]);
  const [done, setDone] = useState(false);

  const reset = (): void => {
    setDone(false);
    setContentType(null);
    setCurrent(0);
    setFile(null);
    setDetails(EMPTY_DETAILS);
    setSections([]);
  };

  return {
    isAdmin,
    done,
    steps: stepsFor(contentType),
    current,
    contentType,
    file,
    details,
    sections,
    submitError: submit.isError ? submit.error.message : undefined,
    isSubmitting: submit.isPending,
    setFile,
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
