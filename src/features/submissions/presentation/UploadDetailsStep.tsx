import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { domainResolver } from '@shared/forms';
import { useAuth } from '@features/auth';
import type { ContentTypeKey } from './upload-content-types';
import { SubmissionTitle } from '../domain';
import type { Details } from './upload-details';
import { required } from './upload-validators';
import { BranchField } from './UploadBranchField';
import {
  GeneralSection,
  MediaSection,
  MetadataSection,
  SeoSection,
  VisibilitySection,
} from './UploadDetailsSections';
import styles from './UploadPage.module.css';

export interface DetailsStepProps {
  readonly defaults: Details;
  readonly onSubmit: (details: Details) => void;
  readonly contentType: ContentTypeKey | null;
}

/** Mandatory Details fields, guarded by the same value objects/rules the backend enforces. */
const detailsResolver = domainResolver<Details>({
  title: (value) => SubmissionTitle.create(value),
  description: required('Description'),
  category: required('Category'),
  difficulty: required('Difficulty'),
});

/** Step 3 — scannable, sectioned authoring form (title validity IS the value object). */
export const DetailsStep = ({
  defaults,
  onSubmit,
  contentType,
}: DetailsStepProps): ReactElement => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Details>({ resolver: detailsResolver, defaultValues: defaults });

  const branchCount = useAuth().user?.branchIds.length ?? 0;

  // Branch is conditionally mandatory: only when the dropdown actually renders (a multi-branch
  // author who turned "Restrict to a branch" on). domainResolver can't see sibling fields, so this
  // cross-field rule lives here.
  const submit = (values: Details): void => {
    if (values.restrictToBranch && branchCount > 1 && values.branch.trim() === '') {
      setError('branch', { type: 'required', message: 'Please select a branch.' });
      return;
    }
    clearErrors('branch');
    onSubmit(values);
  };

  return (
    <form
      id="upload-details"
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className={styles.detailForm}
    >
      <GeneralSection register={register} errors={errors} kind={contentType} />
      <BranchField
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />
      <MediaSection register={register} />
      <MetadataSection register={register} />
      <VisibilitySection register={register} />
      <SeoSection register={register} />
    </form>
  );
};
