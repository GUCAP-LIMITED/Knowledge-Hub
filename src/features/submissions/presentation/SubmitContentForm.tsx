import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Button, TextField } from '@shared/ui';
import { domainResolver } from '@shared/forms';
import { SubmissionTitle } from '../domain';
import styles from './SubmitContentForm.module.css';

interface FormValues {
  title: string;
  type: string;
}

const TYPES = [
  'Document',
  'Video',
  'Spreadsheet',
  'Course',
  'Tutorial',
  'Resource',
] as const;

export interface SubmitContentFormProps {
  readonly isSubmitting: boolean;
  readonly submitLabel: string;
  readonly onSubmit: (values: { title: string; type: string }) => void;
}

/** Create a submission. Validation rules ARE the domain value object (via `domainResolver`). */
export const SubmitContentForm = ({
  isSubmitting,
  submitLabel,
  onSubmit,
}: SubmitContentFormProps): ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: domainResolver<FormValues>({
      title: (value) => SubmissionTitle.create(value),
    }),
    defaultValues: { title: '', type: 'Document' },
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
      <div className={styles.title}>
        <TextField
          label="Title"
          placeholder="e.g. Updated CV Template"
          error={errors.title?.message ?? ''}
          {...register('title')}
        />
      </div>
      <div className={styles.type}>
        <label className={styles.label} htmlFor="submission-type">
          Type
        </label>
        <select id="submission-type" className={styles.select} {...register('type')}>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
};
