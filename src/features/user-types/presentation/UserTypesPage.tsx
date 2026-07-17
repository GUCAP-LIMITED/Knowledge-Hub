import { type ReactElement, useState } from 'react';
import { Alert, DeleteConfirmDialog, EmptyState, PageHeader, Spinner } from '@shared/ui';
import type { UserType } from '../domain';
import { AddUserTypeForm } from './AddUserTypeForm';
import { UserTypeRow } from './UserTypeRow';
import { useDeleteUserType, useUserTypes } from './use-user-types';
import styles from './UserTypesPage.module.css';

/**
 * User-type management: create custom types, view the seniority chain / data scope, and delete
 * custom types. Backed by `/api/app/user-type`; tests cover the slice with the fake gateway.
 */
export const UserTypesPage = (): ReactElement => {
  const userTypes = useUserTypes();
  const deleteUserType = useDeleteUserType();
  const [pendingDelete, setPendingDelete] = useState<UserType | null>(null);

  const confirmDelete = (id: string): void => {
    deleteUserType.mutate(id, {
      onSettled: () => {
        setPendingDelete(null);
      },
    });
  };

  return (
    <main className={styles.screen}>
      <PageHeader
        title="User Types"
        subtitle="Manage the tenant's role catalogue and data scope."
      />

      <AddUserTypeForm />

      {userTypes.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading user types" />
        </div>
      ) : null}

      {userTypes.isError ? (
        <Alert tone="error" title="Could not load user types">
          {userTypes.error.message}
        </Alert>
      ) : null}

      {userTypes.isSuccess && userTypes.data.length === 0 ? (
        <EmptyState
          title="No user types yet"
          description="Create one above to get started."
        />
      ) : null}

      {userTypes.isSuccess && userTypes.data.length > 0 ? (
        <ul className={styles.list}>
          {userTypes.data.map((item) => (
            <UserTypeRow key={item.id} item={item} onDelete={setPendingDelete} />
          ))}
        </ul>
      ) : null}

      <DeleteConfirmDialog
        item={
          pendingDelete !== null
            ? { id: pendingDelete.id, title: pendingDelete.name }
            : null
        }
        noun="user type"
        isBusy={deleteUserType.isPending}
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDelete(null);
        }}
      />
    </main>
  );
};
