import { useEffect, useState, type ReactElement } from 'react';
import { Alert, Button, Modal, Select, TextField } from '@shared/ui';
import type { Course } from '@features/courses';
import type { Assignment } from '../domain';
import type { CreateAssignmentInput } from '../application';
import styles from './AssignTrainingPage.module.css';

interface FormState {
  course: string;
  assignee: string;
  dueDate: string;
}

const EMPTY_FORM: FormState = { course: '', assignee: '', dueDate: '' };

const AssignmentFields = ({
  form,
  courses,
  onChange,
}: {
  readonly form: FormState;
  readonly courses: readonly Course[];
  readonly onChange: (form: FormState) => void;
}): ReactElement => (
  <div className={styles.form}>
    <Select
      label="Course"
      value={form.course}
      onChange={(event) => {
        onChange({ ...form, course: event.target.value });
      }}
    >
      <option value="">Select a course…</option>
      {courses.map((course) => (
        <option key={course.id} value={course.title}>
          {course.title}
        </option>
      ))}
    </Select>
    <TextField
      label="Assignee"
      placeholder="e.g. All Consultants, New Hires"
      value={form.assignee}
      onChange={(event) => {
        onChange({ ...form, assignee: event.target.value });
      }}
    />
    <div className={styles.field}>
      <label className={styles.label} htmlFor="assign-due">
        Due date
      </label>
      <input
        id="assign-due"
        type="date"
        className={styles.dateInput}
        value={form.dueDate}
        onChange={(event) => {
          onChange({ ...form, dueDate: event.target.value });
        }}
      />
    </div>
  </div>
);

export interface CreateModalProps {
  readonly open: boolean;
  readonly courses: readonly Course[];
  readonly creating: boolean;
  readonly error?: string | undefined;
  readonly onClose: () => void;
  readonly onCreate: (input: CreateAssignmentInput) => void;
}

/** Modal to create a new training assignment. */
export const CreateModal = ({
  open,
  courses,
  creating,
  error,
  onClose,
  onCreate,
}: CreateModalProps): ReactElement => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);
  const canSubmit =
    form.course !== '' && form.assignee.trim() !== '' && form.dueDate !== '';
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title="New training assignment"
      description="Assign a course to a group or individual."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={creating}
            disabled={!canSubmit || creating}
            onClick={() => {
              onCreate({
                course: form.course,
                assignee: form.assignee.trim(),
                dueDate: new Date(form.dueDate),
              });
            }}
          >
            Create assignment
          </Button>
        </>
      }
    >
      {error !== undefined ? (
        <Alert tone="error" title="Could not create assignment">
          {error}
        </Alert>
      ) : null}
      <AssignmentFields form={form} courses={courses} onChange={setForm} />
    </Modal>
  );
};

export interface ViewProgressModalProps {
  readonly assignment: Assignment | null;
  readonly onClose: () => void;
}

/** Read-only modal summarising an assignment's status. */
export const ViewProgressModal = ({
  assignment,
  onClose,
}: ViewProgressModalProps): ReactElement => (
  <Modal
    open={assignment !== null}
    onOpenChange={(next) => {
      if (!next) {
        onClose();
      }
    }}
    title={assignment?.course ?? 'Assignment'}
    description={
      assignment !== null
        ? `Assigned to ${assignment.assignee} · Due ${assignment.dueDate.toLocaleDateString()}`
        : undefined
    }
    footer={<Button onClick={onClose}>Close</Button>}
  >
    {assignment !== null ? (
      <p className={styles.note}>
        Current status: <strong>{assignment.status}</strong>. Lesson-level progress for
        this assignment isn’t tracked here — check the learner’s course page for detail.
      </p>
    ) : null}
  </Modal>
);
