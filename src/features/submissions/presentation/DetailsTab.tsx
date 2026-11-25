/* eslint-disable max-lines-per-function, complexity, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-confusing-void-expression */
import { type ReactElement } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, RichTextEditor, Select, Spinner, DurationInput } from '@shared/ui';
import { useContentCategories, CONTENT_DIFFICULTY } from '@features/content';
import { useDraftEditor } from './use-draft-editor';
import { useEffect } from 'react';
import { ReadOnlyDetails } from './ReadOnlyDetails';
import { ThumbnailUploadField } from './ThumbnailUploadField';

const DetailsSchema = z.object({
  title: z
    .string()
    .min(3, 'Title is too short (min 3 characters).')
    .max(200, 'Title must not exceed 200 characters.'),
  subtitle: z
    .string()
    .max(300, 'Subtitle must not exceed 300 characters.')
    .nullable()
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required.')
    .max(4000, 'Description must not exceed 4000 characters.'),
  categoryId: z.string().min(1, 'Category is required.'),
  topic: z
    .string()
    .max(200, 'Topic must not exceed 200 characters.')
    .nullable()
    .optional(),
  difficulty: z.number(),
  language: z
    .string()
    .max(50, 'Language must not exceed 50 characters.')
    .nullable()
    .optional(),
  durationSeconds: z.number().min(0, 'Duration cannot be negative.'),
  visibility: z.number(),
  keywords: z
    .string()
    .max(1000, 'Keywords must not exceed 1000 characters.')
    .nullable()
    .optional(),
  thumbnailAlt: z
    .string()
    .max(300, 'Thumbnail alt must not exceed 300 characters.')
    .nullable()
    .optional(),
  tags: z.string().refine(
    (val) => {
      if (!val?.trim()) return true;
      const tagList = val
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      return tagList.every((t) => t.length <= 80);
    },
    { message: 'Individual tags must not exceed 80 characters each.' },
  ),
});

type DetailsFormValues = z.infer<typeof DetailsSchema>;

export interface DetailsTabProps {
  readonly readOnly?: boolean;
}

export const DetailsTab = ({ readOnly = false }: DetailsTabProps): ReactElement => {
  const {
    content,
    contentId,
    contentTypeKey,
    draftState,
    updateDetails,
    updateTags,
    updateMedia,
  } = useDraftEditor();
  const { data: categories, isLoading: categoriesLoading } =
    useContentCategories(contentTypeKey);

  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(DetailsSchema),
    mode: 'onChange',
    defaultValues: {
      title: draftState.details.title,
      subtitle: draftState.details.subtitle ?? '',
      description: draftState.details.description ?? '',
      categoryId: draftState.details.categoryId ?? '',
      topic: draftState.details.topic ?? '',
      difficulty: draftState.details.difficulty,
      language: draftState.details.language ?? '',
      durationSeconds: draftState.details.durationSeconds,
      visibility: draftState.details.visibility,
      keywords: draftState.details.keywords ?? '',
      thumbnailAlt: draftState.details.thumbnailAlt ?? '',
      tags: draftState.tags.join(', '),
    },
  });

  useEffect(() => {
    if (readOnly) return undefined;
    const subscription = watch((value) => {
      const tags = (value.tags ?? '')
        .split(',')
        .map((t) => t?.trim() ?? '')
        .filter(Boolean);

      updateDetails({
        title: value.title ?? '',
        subtitle: value.subtitle || null,
        description: value.description || null,
        categoryId: value.categoryId || null,
        topic: value.topic || null,
        difficulty: value.difficulty ?? 0,
        language: value.language || null,
        durationSeconds: value.durationSeconds ?? 0,
        visibility: value.visibility ?? 0,
        keywords: value.keywords || null,
        thumbnailAlt: value.thumbnailAlt || null,
      });
      updateTags(tags);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateDetails, updateTags, readOnly]);

  if (categoriesLoading) {
    return <Spinner label="Loading categories..." />;
  }

  const categoryName = categories?.find(
    (c) => c.id === draftState.details.categoryId,
  )?.name;

  if (readOnly) {
    return <ReadOnlyDetails categoryName={categoryName} />;
  }

  const categoryOptions = categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const difficultyOptions = [
    { value: String(CONTENT_DIFFICULTY.Beginner), label: 'Beginner' },
    { value: String(CONTENT_DIFFICULTY.Intermediate), label: 'Intermediate' },
    { value: String(CONTENT_DIFFICULTY.Advanced), label: 'Advanced' },
  ];

  const typeHeader =
    contentTypeKey === 'course'
      ? 'Course Details'
      : contentTypeKey === 'tutorial'
        ? 'Tutorial Details'
        : 'Resource Details';

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {typeHeader}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Update the metadata and text shown on the {contentTypeKey} page.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <TextField
          label="Title"
          required
          maxChars={200}
          {...register('title')}
          error={errors.title?.message}
        />
        <TextField
          label="Subtitle"
          maxChars={300}
          {...register('subtitle')}
          error={errors.subtitle?.message}
        />
      </div>

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <RichTextEditor
            label="Description"
            initialValue={field.value}
            onChange={field.onChange}
            error={errors.description?.message}
          />
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              label="Category"
              options={categoryOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.categoryId?.message}
              placeholder="Select a category..."
            />
          )}
        />

        <Controller
          name="difficulty"
          control={control}
          render={({ field }) => (
            <Select
              label="Difficulty"
              options={difficultyOptions}
              value={String(field.value)}
              onChange={(val) => {
                field.onChange(Number(val));
              }}
              error={errors.difficulty?.message}
            />
          )}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <TextField
          label="Topic"
          maxChars={200}
          {...register('topic')}
          error={errors.topic?.message}
        />
        <TextField
          label="Language"
          maxChars={50}
          {...register('language')}
          error={errors.language?.message}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Controller
          name="durationSeconds"
          control={control}
          render={({ field }) => (
            <DurationInput
              label="Duration"
              mode="seconds"
              value={field.value}
              error={errors.durationSeconds?.message}
              onChange={(_val, totalSeconds) => {
                field.onChange(totalSeconds);
              }}
              onBlur={field.onBlur}
            />
          )}
        />
        <TextField
          label="Tags (comma separated, max 80 chars per tag)"
          {...register('tags')}
          error={errors.tags?.message}
          placeholder="e.g. web, html, css"
        />
      </div>

      <TextField
        label="Keywords (comma separated, max 1000 chars)"
        maxChars={1000}
        {...register('keywords')}
        error={errors.keywords?.message}
        placeholder="For internal search indexing"
      />

      <ThumbnailUploadField
        contentId={contentId}
        liveThumbnailUrl={content.thumbnailUrl}
        draftMedia={draftState.media}
        thumbnailAlt={watch('thumbnailAlt') ?? ''}
        onAltChange={(alt) => {
          setValue('thumbnailAlt', alt, { shouldDirty: true, shouldValidate: true });
          updateDetails({ thumbnailAlt: alt || null });
        }}
        onMediaUpdate={updateMedia}
        onThumbnailAssetIdChange={(id) => {
          updateDetails({ thumbnailMediaAssetId: id });
        }}
        error={errors.thumbnailAlt?.message}
      />
    </form>
  );
};
