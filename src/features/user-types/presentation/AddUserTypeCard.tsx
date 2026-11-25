import type { ReactElement } from 'react';
import { Textarea } from '@shared/ui';
import { cn } from '@shared/utils';
import type { DataAccessScope, UserType } from '../domain';
import { PositionNotice } from './FormPositionNotices';
import { useAddUserTypeCardForm } from './use-add-user-type-card-form';
import { USER_TYPE_CONSTRAINTS } from './user-type-constants';
import {
  AdminToggle,
  AllowLoginToggle,
  FormActions,
  FormHeader,
  NameField,
  ScopePicker,
} from './UserTypeFormFields';
import styles from './UserTypesPage.module.css';

export interface FormValues {
  readonly name: string;
  readonly description: string | null;
  readonly isAdmin: boolean;
  readonly canLogin: boolean;
  readonly dataAccessScope: DataAccessScope;
}

export interface AddUserTypeCardProps {
  readonly editTarget?: UserType | null | undefined;
  readonly name: string;
  readonly onNameChange: (name: string) => void;
  readonly selectedNodeName: string | null;
  readonly currentReportsTo?: string | null | undefined;
  readonly isApexRole?: boolean | undefined;
  readonly existingNames: readonly string[];
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: FormValues) => void;
  readonly onReset: () => void;
  readonly onCancelEdit?: (() => void) | undefined;
  readonly onRevertPosition?: (() => void) | undefined;
}

export const AddUserTypeCard = (props: AddUserTypeCardProps): ReactElement => {
  const form = useAddUserTypeCardForm(props);

  return (
    <form
      onSubmit={form.handleFormSubmit}
      className={cn(styles.formCard, styles.formSticky)}
    >
      <FormHeader isEditMode={form.isEditMode} onCancel={props.onCancelEdit} />

      <div className={styles.formScrollArea}>
        <NameField
          isSeeded={form.isSeeded}
          name={props.name}
          editTargetName={props.editTarget?.name}
          onChange={(v) => {
            props.onNameChange(v);
            if (!form.touched) form.setTouched(true);
          }}
          onBlur={() => {
            form.setTouched(true);
          }}
          error={form.displayNameError}
        />

        <AdminToggle isAdmin={form.isAdmin} onChange={form.setIsAdmin} />

        {form.isEditMode ? (
          <AllowLoginToggle canLogin={form.canLogin} onChange={form.setCanLogin} />
        ) : null}

        <ScopePicker value={form.dataAccessScope} onChange={form.setDataAccessScope} />

        <Textarea
          label="Description (Optional)"
          value={form.description}
          onChange={(e) => {
            form.setDescription(e.target.value);
          }}
          maxLength={USER_TYPE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH}
          rows={2}
          placeholder="Describe role responsibilities..."
        />

        <PositionNotice
          editTarget={props.editTarget}
          isApexRole={props.isApexRole ?? false}
          selectedNodeName={props.selectedNodeName}
          currentReportsTo={props.currentReportsTo}
          attemptedSubmit={form.attemptedSubmit}
          onRevertPosition={props.onRevertPosition}
        />
      </div>

      <FormActions
        isEditMode={form.isEditMode}
        isSubmitting={props.isSubmitting}
        disabled={!form.isFormValid}
        onReset={form.handleReset}
        onCancel={props.onCancelEdit}
      />
    </form>
  );
};
