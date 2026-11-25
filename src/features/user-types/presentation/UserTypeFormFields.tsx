import type { ReactElement } from 'react';
import { Button, Switch, TextField } from '@shared/ui';
import { cn, formatUserType } from '@shared/utils';
import type { DataAccessScope } from '../domain';
import { DATA_ACCESS_SCOPE_OPTIONS, USER_TYPE_CONSTRAINTS } from './user-type-constants';
import styles from './UserTypesPage.module.css';

export const ScopePicker = ({
  value,
  onChange,
}: {
  readonly value: DataAccessScope;
  readonly onChange: (v: DataAccessScope) => void;
}): ReactElement => {
  const selectedOption =
    DATA_ACCESS_SCOPE_OPTIONS.find((opt) => opt.value === value) ??
    DATA_ACCESS_SCOPE_OPTIONS[0];

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Data Scope</span>
      <div className={styles.scopeGrid}>
        {DATA_ACCESS_SCOPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              title={opt.description}
              onClick={() => {
                onChange(opt.value);
              }}
              className={cn(styles.scopeCard, isSelected && styles.scopeCardSelected)}
            >
              <Icon size={14} className={styles.scopeCardIcon} aria-hidden />
              <span className={styles.scopeCardLabel}>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selectedOption !== undefined ? (
        <span className={styles.scopeHelpText}>{selectedOption.description}</span>
      ) : null}
    </div>
  );
};

export const AdminToggle = ({
  isAdmin,
  onChange,
}: {
  readonly isAdmin: boolean;
  readonly onChange: (v: boolean) => void;
}): ReactElement => (
  <div className={styles.adminToggleBox}>
    <div className={styles.toggleText}>
      <span className={styles.toggleLabel}>Is Admin</span>
      <span className={styles.toggleDesc}>Grants admin-level access</span>
    </div>
    <Switch checked={isAdmin} onChange={onChange} label="Is Admin" size="sm" />
  </div>
);

export const AllowLoginToggle = ({
  canLogin,
  onChange,
}: {
  readonly canLogin: boolean;
  readonly onChange: (v: boolean) => void;
}): ReactElement => (
  <div className={styles.adminToggleBox}>
    <div className={styles.toggleText}>
      <span className={styles.toggleLabel}>Allow Login</span>
      <span className={styles.toggleDesc}>
        {canLogin
          ? 'Users with this role are permitted to sign in to Academy.'
          : 'Users with this role are blocked from signing in to Academy.'}
      </span>
    </div>
    <Switch checked={canLogin} onChange={onChange} label="Allow Login" size="sm" />
  </div>
);

export const NameField = ({
  isSeeded,
  name,
  editTargetName,
  onChange,
  onBlur,
  error,
}: {
  readonly isSeeded: boolean;
  readonly name: string;
  readonly editTargetName?: string | null | undefined;
  readonly onChange: (v: string) => void;
  readonly onBlur: () => void;
  readonly error: string | null;
}): ReactElement => {
  if (isSeeded && typeof editTargetName === 'string') {
    return (
      <div className={styles.fieldGroup}>
        <TextField
          label="User Type Name"
          disabled
          value={formatUserType(editTargetName)}
        />
        <span className={styles.nameDisabledHelp}>
          Default user types cannot be renamed
        </span>
      </div>
    );
  }

  return (
    <TextField
      label="User Type Name"
      required
      value={name}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onBlur={onBlur}
      maxLength={USER_TYPE_CONSTRAINTS.MAX_NAME_LENGTH}
      maxChars={USER_TYPE_CONSTRAINTS.MAX_NAME_LENGTH}
      placeholder="e.g. Admission Compliance"
      {...(error !== null ? { error } : {})}
    />
  );
};

export const FormHeader = ({
  isEditMode,
  onCancel,
}: {
  readonly isEditMode: boolean;
  readonly onCancel?: (() => void) | undefined;
}): ReactElement => {
  if (isEditMode) {
    return (
      <div className={styles.cardHeadEdit}>
        <h3 className={styles.cardTitle}>Edit user type</h3>
        {onCancel !== undefined ? (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelEditBtn}
            title="Cancel editing"
          >
            ✕ Cancel
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.cardHead}>
      <h3 className={styles.cardTitle}>Add user type</h3>
    </div>
  );
};

export const FormActions = ({
  isEditMode,
  isSubmitting,
  disabled,
  onReset,
  onCancel,
}: {
  readonly isEditMode: boolean;
  readonly isSubmitting: boolean;
  readonly disabled: boolean;
  readonly onReset: () => void;
  readonly onCancel?: (() => void) | undefined;
}): ReactElement => (
  <div className={styles.formActions}>
    {isEditMode ? (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || disabled}
          isLoading={isSubmitting}
        >
          Save changes
        </Button>
      </>
    ) : (
      <>
        <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || disabled}
          isLoading={isSubmitting}
        >
          + Create user type
        </Button>
      </>
    )}
  </div>
);
