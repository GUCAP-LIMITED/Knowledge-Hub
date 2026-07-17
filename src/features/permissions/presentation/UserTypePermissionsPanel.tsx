import { type ReactElement, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { Alert, Button, DropdownMenu, Modal, Spinner } from '@shared/ui';
import type { PermissionSetSummary, UserTypeDefault } from '../domain';
import { DEFAULT_PERMISSION_SET_COLOR } from './permission-set-colors';
import { usePermissionSets, useSetTypeDefault, useTypeDefaults } from './use-permissions';
import styles from './PermissionsManager.module.css';

interface PendingChange {
  readonly row: UserTypeDefault;
  readonly set: PermissionSetSummary;
}

const spaced = (name: string): string =>
  name.includes(' ') ? name : name.replace(/([A-Z])/g, ' $1').trim();

const TypeCard = ({
  row,
  sets,
  onPick,
}: {
  readonly row: UserTypeDefault;
  readonly sets: readonly PermissionSetSummary[];
  readonly onPick: (set: PermissionSetSummary) => void;
}): ReactElement => {
  const current = sets.find((set) => set.id === row.permissionSetRoleId);
  const color = current?.color ?? DEFAULT_PERMISSION_SET_COLOR.color;
  return (
    <div className={styles.typeCard}>
      <div className={styles.typeHead}>
        <span className={styles.typeIcon}>
          <Users size={18} aria-hidden />
        </span>
        <span className={styles.typeText}>
          <span className={styles.typeName}>{spaced(row.userTypeName)}</span>
          <span className={styles.typeMeta}>
            {row.userCount} member{row.userCount === 1 ? '' : 's'}
          </span>
        </span>
      </div>

      <DropdownMenu
        align="start"
        trigger={
          <button
            type="button"
            className={styles.typeSelect}
            style={{ borderColor: color, color }}
          >
            <span className={styles.typeSelectName}>
              {row.permissionSetName ?? 'No default'}
            </span>
            <ChevronDown size={15} aria-hidden />
          </button>
        }
        items={sets.map((set) => ({
          label: `${set.name} · ${String(set.enabledCount)} permissions`,
          icon: (
            <span
              className={styles.dot}
              style={{ backgroundColor: set.color ?? DEFAULT_PERMISSION_SET_COLOR.color }}
            />
          ),
          onSelect: () => {
            if (set.id !== row.permissionSetRoleId) onPick(set);
          },
        }))}
      />

      {current !== undefined ? (
        <span
          className={styles.typePill}
          style={{
            backgroundColor: current.bgColor ?? undefined,
            color: current.color ?? undefined,
          }}
        >
          {current.enabledCount} permissions enabled
        </span>
      ) : null}
    </div>
  );
};

const ApplyModal = ({
  pending,
  isBusy,
  errorMessage,
  onCancel,
  onApply,
}: {
  readonly pending: PendingChange | null;
  readonly isBusy: boolean;
  readonly errorMessage: string | null;
  readonly onCancel: () => void;
  readonly onApply: (applyToExistingUsers: boolean) => void;
}): ReactElement => (
  <Modal
    open={pending !== null}
    onOpenChange={(next) => {
      if (!next) onCancel();
    }}
    title="Update permission set?"
    description={
      pending === null
        ? undefined
        : `Apply "${pending.set.name}" to ${spaced(pending.row.userTypeName)}.`
    }
    footer={
      <div className={styles.formFooter}>
        <span className={styles.formSpacer} />
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          isLoading={isBusy}
          onClick={() => {
            onApply(false);
          }}
        >
          No, new users only
        </Button>
        <Button
          isLoading={isBusy}
          onClick={() => {
            onApply(true);
          }}
        >
          Yes, apply to existing
        </Button>
      </div>
    }
  >
    <p className={styles.applyText}>
      New members of this user type get the new set automatically. Should existing members
      switch over too?
    </p>
    {errorMessage !== null ? (
      <Alert tone="error" title="Could not update">
        {errorMessage}
      </Alert>
    ) : null}
  </Modal>
);

/** Binds each user type to a default permission set, with a 3-way "apply to existing?" confirm. */
export const UserTypePermissionsPanel = (): ReactElement => {
  const defaults = useTypeDefaults();
  const sets = usePermissionSets();
  const setDefault = useSetTypeDefault();
  const [pending, setPending] = useState<PendingChange | null>(null);

  const apply = (applyToExistingUsers: boolean): void => {
    if (pending === null) return;
    setDefault.mutate(
      {
        userTypeId: pending.row.userTypeId,
        permissionSetRoleId: pending.set.id,
        applyToExistingUsers,
      },
      {
        onSuccess: () => {
          setPending(null);
        },
      },
    );
  };

  return (
    <section>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>User Type Permissions</h3>
      </div>

      {defaults.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading user types" />
        </div>
      ) : null}

      {defaults.isError ? (
        <Alert tone="error" title="Could not load user types">
          {defaults.error.message}
        </Alert>
      ) : null}

      {defaults.isSuccess ? (
        <div className={styles.typeGrid}>
          {defaults.data.map((row) => (
            <TypeCard
              key={row.userTypeId}
              row={row}
              sets={sets.data ?? []}
              onPick={(set) => {
                setPending({ row, set });
              }}
            />
          ))}
        </div>
      ) : null}

      <ApplyModal
        pending={pending}
        isBusy={setDefault.isPending}
        errorMessage={setDefault.isError ? setDefault.error.message : null}
        onCancel={() => {
          setPending(null);
        }}
        onApply={apply}
      />
    </section>
  );
};
