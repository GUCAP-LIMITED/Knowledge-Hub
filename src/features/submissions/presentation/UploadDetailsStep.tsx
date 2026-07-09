import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { domainResolver } from '@shared/forms';
import { SubmissionTitle } from '../domain';
import type { Details } from './upload-details';
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
}

/** Step 3 — scannable, sectioned authoring form (title validity IS the value object). */
export const DetailsStep = ({ defaults, onSubmit }: DetailsStepProps): ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Details>({
    resolver: domainResolver<Details>({
      title: (value) => SubmissionTitle.create(value),
    }),
    defaultValues: defaults,
  });

  return (
    <form
      id="upload-details"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className={styles.detailForm}
    >
      <GeneralSection register={register} errors={errors} />
      <MediaSection register={register} />
      <MetadataSection register={register} />
      <VisibilitySection register={register} />
      <SeoSection register={register} />
    </form>
  );
};
