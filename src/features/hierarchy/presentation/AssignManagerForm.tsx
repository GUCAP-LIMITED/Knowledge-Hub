import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, TextField } from '@shared/ui';
import { useAssignManager } from './use-hierarchy';
import styles from './HierarchyPage.module.css';

interface AssignFormValues {
  subordinateId: string;
  subordinateUserTypeId: string;
  managerId: string;
  managerUserTypeId: string;
}

const EMPTY: AssignFormValues = {
  subordinateId: '',
  subordinateUserTypeId: '',
  managerId: '',
  managerUserTypeId: '',
};

/**
 * Assign or replace a subordinate's manager within a branch. IDs are entered directly (a branch user
 * directory is not yet wired into this concept app); the backend validates branch membership,
 * seniority, and cycles.
 */
export const AssignManagerForm = ({
  branchId,
}: {
  readonly branchId: string;
}): ReactElement => {
  const assignManager = useAssignManager();
  const { register, handleSubmit, reset } = useForm<AssignFormValues>({
    defaultValues: EMPTY,
  });

  const onSubmit = handleSubmit((values) => {
    assignManager.mutate(
      { ...values, branchId },
      {
        onSuccess: () => {
          reset(EMPTY);
        },
      },
    );
  });

  return (
    <form
      className={styles.panel}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    >
      <h2 className={styles.panelTitle}>Assign manager</h2>
      <div className={styles.formGrid}>
        <TextField label="Subordinate user id" {...register('subordinateId')} />
        <TextField
          label="Subordinate user-type id"
          {...register('subordinateUserTypeId')}
        />
        <TextField label="Manager user id" {...register('managerId')} />
        <TextField label="Manager user-type id" {...register('managerUserTypeId')} />
      </div>
      <Button type="submit" isLoading={assignManager.isPending}>
        Assign
      </Button>
      {assignManager.isError ? (
        <Alert tone="error" title="Could not assign manager">
          {assignManager.error.message}
        </Alert>
      ) : null}
    </form>
  );
};
