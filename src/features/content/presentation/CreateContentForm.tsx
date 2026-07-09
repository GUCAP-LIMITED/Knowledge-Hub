import { useState, type FormEvent, type ReactElement } from 'react';
import { Button, Select, TextField } from '@shared/ui';
import { ContentTitle, type ContentType } from '../domain';
import styles from './ContentManagementPage.module.css';

const TYPES: readonly ContentType[] = [
  'Course',
  'Tutorial',
  'Article',
  'Document',
  'Resource',
];

const isContentType = (value: string): value is ContentType =>
  (TYPES as readonly string[]).includes(value);

export interface CreateContentFormValues {
  readonly title: string;
  readonly type: ContentType;
}

export interface CreateContentFormProps {
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: CreateContentFormValues) => void;
}

/** Authoring form for a new content item. Title validity IS the domain value object. */
export const CreateContentForm = ({
  isSubmitting,
  onSubmit,
}: CreateContentFormProps): ReactElement => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('Course');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const validated = ContentTitle.create(title);
    if (!validated.ok) {
      setError(validated.error.message);
      return;
    }
    setError('');
    onSubmit({ title: validated.value.value, type });
    setTitle('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>
        <TextField
          label="Title"
          placeholder="e.g. Getting Started with UAPP Portal"
          value={title}
          error={error}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
      </div>
      <Select
        label="Type"
        value={type}
        onChange={(event) => {
          const value = event.target.value;
          if (isContentType(value)) {
            setType(value);
          }
        }}
      >
        {TYPES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Button type="submit" isLoading={isSubmitting}>
        Create content
      </Button>
    </form>
  );
};
