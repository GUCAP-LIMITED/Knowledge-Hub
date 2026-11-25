import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { domainResolver } from '@shared/forms';
import { useAuth } from '@features/auth';
import type { ContentTypeKey } from './upload-content-types';
import { SubmissionTitle } from '../domain';
import { type Details, FIELD_LIMITS } from './upload-details';
import {
  maxLength,
  required,
  requiredWithMaxLength,
  validateTags,
} from './upload-validators';
import { AudienceSection } from './AudienceSection';
import {
  GeneralSection,
  MediaSection,
  MetadataSection,
  SeoSection,
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
  subtitle: maxLength('Subtitle', FIELD_LIMITS.SUBTITLE_MAX),
  description: requiredWithMaxLength('Description', FIELD_LIMITS.DESCRIPTION_MAX),
  category: required('Category'),
  topic: maxLength('Topic', FIELD_LIMITS.TOPIC_MAX),
  difficulty: required('Difficulty'),
  language: maxLength('Language', FIELD_LIMITS.LANGUAGE_MAX),
  keywords: maxLength('Keywords', FIELD_LIMITS.KEYWORDS_MAX),
  thumbnailAlt: maxLength('Thumbnail alt text', FIELD_LIMITS.THUMBNAIL_ALT_MAX),
  tags: validateTags,
});

/** Step 3 — scannable, sectioned authoring form (title validity IS the value object). */
export const DetailsStep = ({
  defaults,
  onSubmit,
  contentType,
}: DetailsStepProps): ReactElement => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Details>({
    resolver: detailsResolver,
    defaultValues: defaults,
    mode: 'onChange',
  });

  const branchCount = useAuth().user?.branchIds.length ?? 0;

  const submit = (values: Details): void => {
    const isAllBranchesOrPublic =
      values.visibility === 'public' ||
      values.audienceGroups.some((g) => g.isAllBranches) ||
      values.audienceGroups.every((g) => g.accessType === 'public');

    if (
      values.visibility !== 'private' &&
      branchCount > 0 &&
      values.branches.length === 0 &&
      !isAllBranchesOrPublic
    ) {
      setError('branches', {
        type: 'required',
        message: 'Please select at least one branch for your audience groups.',
      });
      return;
    }
    clearErrors('branches');
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
      <GeneralSection
        register={register}
        control={control}
        errors={errors}
        kind={contentType}
      />
      <AudienceSection
        control={control}
        watch={watch}
        setValue={setValue}
        register={register}
        errors={errors}
      />
      <MediaSection register={register} errors={errors} />
      <MetadataSection register={register} control={control} errors={errors} />
      <SeoSection register={register} errors={errors} />
    </form>
  );
};
