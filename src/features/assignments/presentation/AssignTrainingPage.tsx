import { useState, type ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { Button, PageHeader, Spinner } from '@shared/ui';
import { useCourses } from '@features/courses';
import type { Assignment } from '../domain';
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from './use-assignments';
import { AssignmentList } from './AssignmentList';
import { CreateModal, ViewProgressModal } from './AssignmentModals';
import styles from './AssignTrainingPage.module.css';

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

      <AssignmentList
        list={list}
        error={assignments.isError ? assignments.error : null}
        deleting={del.isPending}
        onNew={() => {
          setModalOpen(true);
        }}
        onView={setViewing}
        onDelete={(id) => {
          del.mutate(id);
        }}
      />

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
