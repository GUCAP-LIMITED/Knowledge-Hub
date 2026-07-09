import { useEffect, useState, type ReactElement } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  IconButton,
  Modal,
  PageHeader,
  Select,
  Spinner,
  TextField,
  type BadgeTone,
} from '@shared/ui';
import { useCourses, type Course } from '@features/courses';
import type { Assignment, AssignmentStatus } from '../domain';
import type { CreateAssignmentInput } from '../application';
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from './use-assignments';
import styles from './AssignTrainingPage.module.css';

const statusTone = (status: AssignmentStatus): BadgeTone => {
  if (status === 'completed') {
    return 'success';
  }
  return status === 'overdue' ? 'warning' : 'info';
};

const AssignmentCard = ({
  assignment,
  deleting,
  onView,
  onDelete,
}: {
  readonly assignment: Assignment;
  readonly deleting: boolean;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.iconTile}>
        <ClipboardList size={20} aria-hidden="true" />
      </span>
      <Badge tone={statusTone(assignment.status)}>{assignment.status}</Badge>
    </div>
    <h3 className={styles.cardTitle}>{assignment.course}</h3>
    <div className={styles.rows}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Assignee</span>
        <span className={styles.rowValue}>{assignment.assignee}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Due</span>
        <span className={styles.rowValue}>{assignment.dueDate.toLocaleDateString()}</span>
      </div>
    </div>
    <div className={styles.cardActions}>
      <Button
        size="sm"
        variant="ghost"
        fullWidth
        onClick={() => {
          onView(assignment);
        }}
      >
        View progress
      </Button>
      <IconButton
        label="Delete assignment"
        variant="danger"
        disabled={deleting}
        onClick={() => {
          onDelete(assignment.id);
        }}
      >
        <Trash2 size={16} />
      </IconButton>
    </div>
  </article>
);

const CreateModal = ({
  open,
  courses,
  creating,
  error,
  onClose,
  onCreate,
}: {
  readonly open: boolean;
  readonly courses: readonly Course[];
  readonly creating: boolean;
  readonly error?: string | undefined;
  readonly onClose: () => void;
  readonly onCreate: (input: CreateAssignmentInput) => void;
}): ReactElement => {
  const [form, setForm] = useState({ course: '', assignee: '', dueDate: '' });
  useEffect(() => {
    if (!open) {
      setForm({ course: '', assignee: '', dueDate: '' });
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
            disabled={!canSubmit}
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
      <div className={styles.form}>
        <Select
          label="Course"
          value={form.course}
          onChange={(event) => {
            setForm({ ...form, course: event.target.value });
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
            setForm({ ...form, assignee: event.target.value });
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
              setForm({ ...form, dueDate: event.target.value });
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

const ViewProgressModal = ({
  assignment,
  onClose,
}: {
  readonly assignment: Assignment | null;
  readonly onClose: () => void;
}): ReactElement => (
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
        Status: <strong>{assignment.status}</strong>. Per-learner progress tracking is
        coming soon.
      </p>
    ) : null}
  </Modal>
);

/** Assign Training: card grid + create modal. Admin only. */
export const AssignTrainingPage = (): ReactElement => {
  const assignments = useAssignments();
  const courses = useCourses();
  const create = useCreateAssignment();
  const del = useDeleteAssignment();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState<Assignment | null>(null);
  const list = assignments.data ?? [];

  if (assignments.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading assignments" />
      </div>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Assign Training"
        subtitle="Assign mandatory courses to teams or individuals"
      >
        <Button
          onClick={() => {
            setModalOpen(true);
          }}
        >
          <Plus size={16} aria-hidden="true" /> New assignment
        </Button>
      </PageHeader>

      {assignments.isError ? (
        <Alert tone="error" title="Could not load assignments">
          {assignments.error.message}
        </Alert>
      ) : null}

      {!assignments.isError && list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No active assignments"
          description="Create one to keep your team's learning on track."
          action={
            <Button
              onClick={() => {
                setModalOpen(true);
              }}
            >
              New assignment
            </Button>
          }
        />
      ) : null}

      {list.length > 0 ? (
        <div className={styles.grid}>
          {list.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              deleting={del.isPending}
              onView={setViewing}
              onDelete={(id) => {
                del.mutate(id);
              }}
            />
          ))}
        </div>
      ) : null}

      <CreateModal
        open={modalOpen}
        courses={courses.data ?? []}
        creating={create.isPending}
        error={create.isError ? create.error.message : undefined}
        onClose={() => {
          setModalOpen(false);
        }}
        onCreate={(input) => {
          create.mutate(input, {
            onSuccess: () => {
              setModalOpen(false);
            },
          });
        }}
      />
      <ViewProgressModal
        assignment={viewing}
        onClose={() => {
          setViewing(null);
        }}
      />
    </section>
  );
};
