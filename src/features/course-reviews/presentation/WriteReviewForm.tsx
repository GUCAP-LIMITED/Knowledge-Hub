import type { ReactElement } from 'react';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { Button } from '@shared/ui';
import { domainResolver } from '@shared/forms';
import { Rating, ReviewFeedback } from '../domain';
import { REVIEWABLE_COURSES } from '../infrastructure';
import { StarRating } from './StarRating';
import styles from './WriteReviewForm.module.css';

interface FormValues {
  courseId: string;
  rating: number;
  feedback: string;
}

const CourseSelect = ({
  register,
}: {
  readonly register: UseFormRegister<FormValues>;
}): ReactElement => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor="review-course">
      Course
    </label>
    <select id="review-course" className={styles.select} {...register('courseId')}>
      {REVIEWABLE_COURSES.map((course) => (
        <option key={course.id} value={course.id}>
          {course.name}
        </option>
      ))}
    </select>
  </div>
);

export interface WriteReviewFormProps {
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: FormValues) => void;
  /** When set, the review is scoped to this course and the picker is hidden. */
  readonly lockedCourse?: { readonly id: string; readonly name: string };
}

/** Rate and review a course. Rating + comment are validated by their domain value objects. */
export const WriteReviewForm = ({
  isSubmitting,
  onSubmit,
  lockedCourse,
}: WriteReviewFormProps): ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: domainResolver<FormValues>({
      rating: (value) => Rating.create(value),
      feedback: (value) => ReviewFeedback.create(value),
    }),
    defaultValues: {
      courseId: lockedCourse?.id ?? REVIEWABLE_COURSES[0]?.id ?? '',
      rating: 0,
      feedback: '',
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values);
    reset();
  });

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      {lockedCourse === undefined ? <CourseSelect register={register} /> : null}

      <div className={styles.field}>
        <span className={styles.label}>Your rating</span>
        <StarRating
          value={watch('rating')}
          onChange={(next) => {
            setValue('rating', next, { shouldValidate: true });
          }}
        />
        {errors.rating !== undefined ? (
          <span className={styles.error}>{errors.rating.message}</span>
        ) : null}
      </div>

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
        {errors.feedback !== undefined ? (
          <span className={styles.error}>{errors.feedback.message}</span>
        ) : null}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        Submit review
      </Button>
    </form>
  );
};
