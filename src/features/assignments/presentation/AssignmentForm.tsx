import { useState, type FormEvent, type ReactElement } from 'react';
import { Button, TextField } from '@shared/ui';
import styles from './AssignTrainingPage.module.css';

export interface AssignmentFormValues {
  readonly course: string;
  readonly assignee: string;
  readonly dueDate: Date;
}

export interface AssignmentFormProps {
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: AssignmentFormValues) => void;
}

/** Compact create form for a new training assignment. Parses the date input into a `Date`. */
export const AssignmentForm = ({
  isSubmitting,
  onSubmit,
}: AssignmentFormProps): ReactElement => {
  const [course, setCourse] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({ course, assignee, dueDate: new Date(dueDate) });
    setCourse('');
    setAssignee('');
    setDueDate('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label="Course"
        placeholder="e.g. Compliance & Legal Requirements"
        value={course}
        onChange={(event) => {
          setCourse(event.target.value);
        }}
      />
      <TextField
        label="Assignee"
        placeholder="e.g. All Consultants"
        value={assignee}
        onChange={(event) => {
          setAssignee(event.target.value);
        }}
      />
      <div className={styles.field}>
        <label className={styles.label} htmlFor="assignment-due-date">
          Due date
        </label>
        <input
          id="assignment-due-date"
          type="date"
          className={styles.dateInput}
          value={dueDate}
          onChange={(event) => {
            setDueDate(event.target.value);
          }}
        />
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        Assign
      </Button>
    </form>
  );
};
