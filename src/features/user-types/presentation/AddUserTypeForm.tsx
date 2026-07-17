import { type ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Select, Switch, TextField } from '@shared/ui';
import { domainResolver } from '@shared/forms';
import { type DataAccessScope, UserTypeName } from '../domain';
import { useCreateUserType } from './use-user-types';
import styles from './UserTypesPage.module.css';

interface AddUserTypeFormValues {
  name: string;
  description: string;
  hierarchyLevel: number;
  dataAccessScope: string;
}

function toScope(value: number): DataAccessScope {
  if (value === 10) return 10;
  if (value === 5) return 5;
  return 0;
}

/**
 * Create form for a custom user type. The name delegates validation to the UserTypeName value object
 * via domainResolver — the same rule the use case enforces. Server-side errors (e.g. duplicate name)
 * surface below the form.
 */
export const AddUserTypeForm = (): ReactElement => {
  const createUserType = useCreateUserType();
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserTypeFormValues>({
    defaultValues: { name: '', description: '', hierarchyLevel: 0, dataAccessScope: '0' },
    resolver: domainResolver<AddUserTypeFormValues>({
      name: (value) => UserTypeName.create(value),
    }),
  });

  const onSubmit = handleSubmit((values) => {
    createUserType.mutate(
      {
        name: values.name,
        description: values.description.trim() === '' ? null : values.description.trim(),
        displayOrder: 0,
        isAdmin,
        hierarchyLevel: values.hierarchyLevel,
        dataAccessScope: toScope(Number(values.dataAccessScope)),
      },
      {
        onSuccess: () => {
          reset();
          setIsAdmin(false);
        },
      },
    );
  });

  return (
    <form
      className={styles.addForm}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    >
      <div className={styles.formGrid}>
        <TextField
          label="Name"
          placeholder="e.g. Regional Lead"
          {...(errors.name?.message !== undefined ? { error: errors.name.message } : {})}
          {...register('name')}
        />
        <TextField
          label="Description"
          placeholder="Optional"
          {...register('description')}
        />
        <TextField
          label="Hierarchy level"
          type="number"
          min={0}
          {...register('hierarchyLevel', { valueAsNumber: true })}
        />
        <Select label="Data access scope" {...register('dataAccessScope')}>
          <option value="0">Self</option>
          <option value="5">Team</option>
          <option value="10">Branch — all</option>
        </Select>
      </div>

      <div className={styles.formFooter}>
        <Switch
          checked={isAdmin}
          onChange={setIsAdmin}
          label="Org admin (all-branch access)"
        />
        <Button type="submit" isLoading={createUserType.isPending}>
          Add user type
        </Button>
      </div>

      {createUserType.isError ? (
        <Alert tone="error" title="Could not create user type">
          {createUserType.error.message}
        </Alert>
      ) : null}
    </form>
  );
};
