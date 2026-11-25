import type { ReactElement, ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { Image, Info, Search, Tags } from 'lucide-react';
import { RichTextEditor, Select, TextField, type SelectOption } from '@shared/ui';
import {
  type CategoryKind,
  type ContentCategory,
  useContentCategories,
} from '@features/content';
import { DIFFICULTIES, type Details, LANGUAGES } from './upload-details';
import styles from './UploadPage.module.css';

type Register = UseFormRegister<Details>;

/** Category options for the current type — value is the category id (what the backend persists). */
function categoryOptions(
  query: UseQueryResult<readonly ContentCategory[]>,
): SelectOption[] {
  return (query.data ?? []).map((cat) => ({ value: cat.id, label: cat.name }));
}

function categoryPlaceholder(query: UseQueryResult<readonly ContentCategory[]>): string {
  if (query.isLoading) {
    return 'Loading…';
  }
  return (query.data ?? []).length === 0 ? 'No categories yet' : 'Select…';
}

const DIFFICULTY_OPTIONS: SelectOption[] = DIFFICULTIES.map((level) => ({
  value: level,
  label: level,
}));

const LANGUAGE_OPTIONS: SelectOption[] = LANGUAGES.map((lang) => ({
  value: lang,
  label: lang,
}));

export const DetailsSection = ({
  icon: Icon,
  title,
  children,
}: {
  readonly icon: typeof Info;
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement => (
  <section className={styles.detailSection}>
    <div className={styles.detailSectionHead}>
      <span className={styles.detailSectionIcon}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <h3 className={styles.detailSectionTitle}>{title}</h3>
    </div>
    {children}
  </section>
);

const GeneralSectionMeta = ({
  register,
  control,
  errors,
  categories,
}: {
  readonly register: Register;
  readonly control: Control<Details>;
  readonly errors: FieldErrors<Details>;
  readonly categories: UseQueryResult<readonly ContentCategory[]>;
}): ReactElement => (
  <div className={styles.formRow}>
    <Controller
      name="category"
      control={control}
      render={({ field }) => (
        <Select
          label="Category"
          required
          error={errors.category?.message ?? ''}
          placeholder={categoryPlaceholder(categories)}
          disabled={categories.isLoading}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={categoryOptions(categories)}
        />
      )}
    />
    <TextField
      label="Topic"
      placeholder="e.g. Objection handling"
      maxChars={200}
      error={errors.topic?.message}
      {...register('topic')}
    />
    <Controller
      name="difficulty"
      control={control}
      render={({ field }) => (
        <Select
          label="Difficulty"
          required
          error={errors.difficulty?.message ?? ''}
          placeholder="Select…"
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={DIFFICULTY_OPTIONS}
        />
      )}
    />
  </div>
);

export const GeneralSection = ({
  register,
  control,
  errors,
  kind,
}: {
  readonly register: Register;
  readonly control: Control<Details>;
  readonly errors: FieldErrors<Details>;
  readonly kind: CategoryKind | null;
}): ReactElement => {
  const categories = useContentCategories(kind ?? 'course');
  return (
    <DetailsSection icon={Info} title="General information">
      <div className={styles.form}>
        <TextField
          label="Title"
          required
          placeholder="e.g. Mastering the UAPP Sales Pipeline"
          maxChars={200}
          error={errors.title?.message ?? ''}
          {...register('title')}
        />
        <TextField
          label="Subtitle"
          placeholder="Short, benefit-led summary"
          maxChars={300}
          error={errors.subtitle?.message}
          {...register('subtitle')}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              label="Description"
              required
              initialValue={field.value}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
        <GeneralSectionMeta
          register={register}
          control={control}
          errors={errors}
          categories={categories}
        />
      </div>
    </DetailsSection>
  );
};

export const MetadataSection = ({
  register,
  control,
  errors,
}: {
  readonly register: Register;
  readonly control: Control<Details>;
  readonly errors?: FieldErrors<Details>;
}): ReactElement => (
  <DetailsSection icon={Tags} title="Metadata">
    <div className={styles.form}>
      <TextField
        label="Tags"
        placeholder="Comma-separated (max 80 chars per tag)"
        error={errors?.tags?.message}
        {...register('tags')}
      />
      <Controller
        name="language"
        control={control}
        render={({ field }) => (
          <Select
            label="Language"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={LANGUAGE_OPTIONS}
          />
        )}
      />
    </div>
  </DetailsSection>
);

export const MediaSection = ({
  register,
  errors,
}: {
  readonly register: Register;
  readonly errors?: FieldErrors<Details>;
}): ReactElement => (
  <DetailsSection icon={Image} title="Media">
    <div className={styles.formRow}>
      <TextField
        label="Thumbnail alt text"
        placeholder="For accessibility"
        maxChars={300}
        error={errors?.thumbnailAlt?.message}
        {...register('thumbnailAlt')}
      />
      <TextField
        label="Cover image alt"
        placeholder="For the banner image"
        maxChars={300}
        error={errors?.coverAlt?.message}
        {...register('coverAlt')}
      />
    </div>
  </DetailsSection>
);

export const SeoSection = ({
  register,
  errors,
}: {
  readonly register: Register;
  readonly errors?: FieldErrors<Details>;
}): ReactElement => (
  <DetailsSection icon={Search} title="SEO & discovery">
    <TextField
      label="Search keywords"
      placeholder="onboarding, portal, new joiner"
      maxChars={1000}
      error={errors?.keywords?.message}
      {...register('keywords')}
    />
  </DetailsSection>
);
