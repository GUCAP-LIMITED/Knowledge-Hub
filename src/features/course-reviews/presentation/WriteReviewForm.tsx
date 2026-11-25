import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@shared/ui';
import { domainResolver } from '@shared/forms';
import { Rating, ReviewFeedback, type SelectableContentItem } from '../domain';
import { StarRating } from './StarRating';
import { ContentTypeAndItemPickers, type ContentTypeFilter } from './ContentItemPickers';
import styles from './WriteReviewForm.module.css';

export type { ContentTypeFilter };

interface FormValues {
  courseId: string;
  rating: number;
  feedback: string;
}

export interface WriteReviewFormProps {
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: FormValues) => void;
  readonly contentType?: ContentTypeFilter | undefined;
  readonly contentItemId?: string | undefined;
  readonly selectedItemTitle?: string | undefined;
  readonly onContentTypeChange?: ((type: ContentTypeFilter) => void) | undefined;
  readonly onContentItemChange?:
    | ((id: string | undefined, item?: SelectableContentItem) => void)
    | undefined;
  /** Available courses to review (legacy fallback). */
  readonly courses?:
    | readonly {
        readonly id: string;
        readonly title?: string | undefined;
        readonly name?: string | undefined;
      }[]
    | undefined;
  /** When set, the review is scoped to this course and the picker is hidden. */
  readonly lockedCourse?:
    | {
        readonly id: string;
        readonly title?: string | undefined;
        readonly name?: string | undefined;
      }
    | undefined;
}

const resolveTargetId = (
  lockedCourseId: string | undefined,
  contentItemId: string | undefined,
  courseId: string,
): string | null => {
  const id = lockedCourseId ?? contentItemId ?? courseId;
  if (!id || id === 'all') {
    return null;
  }
  return id;
};

const RatingPickerField = ({
  rating,
  error,
  onChange,
}: {
  readonly rating: number;
  readonly error?: string | undefined;
  readonly onChange: (next: number) => void;
}): ReactElement => (
  <div className={styles.field}>
    <span className={styles.label} id="review-rating-label">
      Your rating
    </span>
    <StarRating
      value={rating}
      labelledBy="review-rating-label"
      size="lg"
      onChange={onChange}
    />
    {error !== undefined ? <span className={styles.error}>{error}</span> : null}
  </div>
);

const FeedbackTextareaField = ({
  register,
  error,
}: {
  readonly register: ReturnType<typeof useForm<FormValues>>['register'];
  readonly error?: string | undefined;
}): ReactElement => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor="review-feedback">
      Your review
    </label>
    <textarea
      id="review-feedback"
      className={styles.textarea}
      rows={3}
      placeholder="What did you think?"
      {...register('feedback')}
    />
    {error !== undefined ? <span className={styles.error}>{error}</span> : null}
  </div>
);

interface ReviewFormManager {
  readonly register: ReturnType<typeof useForm<FormValues>>['register'];
  readonly watch: ReturnType<typeof useForm<FormValues>>['watch'];
  readonly setValue: ReturnType<typeof useForm<FormValues>>['setValue'];
  readonly errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  readonly itemError: string | null;
  readonly setItemError: (error: string | null) => void;
  readonly handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const useReviewFormManager = (
  lockedCourseId: string | undefined,
  contentItemId: string | undefined,
  initialCourseId: string,
  onSubmit: (values: FormValues) => void,
): ReviewFormManager => {
  const [itemError, setItemError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: domainResolver<FormValues>({
      rating: (value) => Rating.create(value),
      feedback: (value) => ReviewFeedback.create(value),
    }),
    defaultValues: {
      courseId: initialCourseId,
      rating: 0,
      feedback: '',
    },
  });

  const onSubmitHandler = form.handleSubmit((values) => {
    const targetId = resolveTargetId(lockedCourseId, contentItemId, values.courseId);
    if (!targetId) {
      setItemError('Please select a specific content item to review');
      return;
    }
    onSubmit({ ...values, courseId: targetId });
    form.reset({ courseId: targetId, rating: 0, feedback: '' });
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    void onSubmitHandler(event);
  };

  return {
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    errors: form.formState.errors,
    itemError,
    setItemError,
    handleSubmit,
  };
};

const renderPickers = (
  props: WriteReviewFormProps,
  hasItemError: boolean,
  onTypeChange: (type: ContentTypeFilter) => void,
  onItemChange: (id: string | undefined, item?: SelectableContentItem) => void,
): ReactElement | null => {
  if (props.lockedCourse !== undefined) {
    return null;
  }
  if (!props.onContentTypeChange || !props.onContentItemChange) {
    return null;
  }
  return (
    <div className={styles.topRow}>
      <ContentTypeAndItemPickers
        contentType={props.contentType ?? 'all'}
        selectedItemValue={props.contentItemId ?? 'all'}
        selectedItemTitle={props.selectedItemTitle}
        hasItemError={hasItemError}
        onContentTypeChange={onTypeChange}
        onContentItemChange={onItemChange}
      />
    </div>
  );
};

/** Rate and review content with unified type and item selection in the first row. */
export const WriteReviewForm = (props: WriteReviewFormProps): ReactElement => {
  const { isSubmitting, onSubmit, courses = [], lockedCourse, contentItemId } = props;

  const fallbackCourseId = courses[0]?.id ?? '';
  const initialCourseId = lockedCourse?.id ?? contentItemId ?? fallbackCourseId;
  const manager = useReviewFormManager(
    lockedCourse?.id,
    contentItemId,
    initialCourseId,
    onSubmit,
  );

  const handleTypeChange = (type: ContentTypeFilter): void => {
    manager.setItemError(null);
    props.onContentTypeChange?.(type);
  };

  const handleItemChange = (
    id: string | undefined,
    item?: SelectableContentItem,
  ): void => {
    manager.setItemError(null);
    props.onContentItemChange?.(id, item);
  };

  return (
    <form className={styles.form} onSubmit={manager.handleSubmit}>
      {renderPickers(
        props,
        Boolean(manager.itemError),
        handleTypeChange,
        handleItemChange,
      )}

      {manager.itemError !== null ? (
        <span className={styles.error}>{manager.itemError}</span>
      ) : null}

      <RatingPickerField
        rating={manager.watch('rating')}
        error={manager.errors.rating?.message}
        onChange={(next) => {
          manager.setValue('rating', next, { shouldValidate: true });
        }}
      />

      <FeedbackTextareaField
        register={manager.register}
        error={manager.errors.feedback?.message}
      />

      <Button type="submit" isLoading={isSubmitting} className={styles.submit}>
        Submit review
      </Button>
    </form>
  );
};
