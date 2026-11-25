import { type FormEvent, useState } from 'react';
import { formatUserType } from '@shared/utils';
import type { DataAccessScope, UserType } from '../domain';
import type { FormValues } from './AddUserTypeCard';
import { USER_TYPE_CONSTRAINTS } from './user-type-constants';

export interface UseAddUserTypeCardFormParams {
  readonly editTarget?: UserType | null | undefined;
  readonly name: string;
  readonly onNameChange: (name: string) => void;
  readonly selectedNodeName: string | null;
  readonly existingNames: readonly string[];
  readonly onSubmit: (values: FormValues) => void;
  readonly onReset: () => void;
}

export interface UseAddUserTypeCardFormReturn {
  readonly isEditMode: boolean;
  readonly isSeeded: boolean;
  readonly description: string;
  readonly setDescription: (desc: string) => void;
  readonly isAdmin: boolean;
  readonly setIsAdmin: (isAdmin: boolean) => void;
  readonly canLogin: boolean;
  readonly setCanLogin: (canLogin: boolean) => void;
  readonly dataAccessScope: DataAccessScope;
  readonly setDataAccessScope: (scope: DataAccessScope) => void;
  readonly touched: boolean;
  readonly setTouched: (touched: boolean) => void;
  readonly attemptedSubmit: boolean;
  readonly isFormValid: boolean;
  readonly displayNameError: string | null;
  readonly handleFormSubmit: (e: FormEvent) => void;
  readonly handleReset: () => void;
}

function validateName(
  trimmed: string,
  existingNames: readonly string[],
  currentName?: string | null,
): string | null {
  if (trimmed.length === 0) return 'User type name is required';
  if (trimmed.length > USER_TYPE_CONSTRAINTS.MAX_NAME_LENGTH) {
    return `Must not exceed ${String(USER_TYPE_CONSTRAINTS.MAX_NAME_LENGTH)} characters`;
  }
  const isDuplicate = existingNames
    .filter((n) => n.trim().toUpperCase() !== currentName?.trim().toUpperCase())
    .some((n) => n.trim().toUpperCase() === trimmed.toUpperCase());
  if (isDuplicate) return `A user type named "${trimmed}" already exists`;
  return null;
}

interface InitialFormValues {
  readonly description: string;
  readonly isAdmin: boolean;
  readonly canLogin: boolean;
  readonly dataAccessScope: DataAccessScope;
}

function resolveInitialValues(target?: UserType | null): InitialFormValues {
  return {
    description: target?.description ?? '',
    isAdmin: target?.isAdmin ?? false,
    canLogin: target?.canLogin ?? true,
    dataAccessScope: target?.dataAccessScope ?? 0,
  };
}

function computeFormValid(
  isEditMode: boolean,
  isSeeded: boolean,
  isValidName: boolean,
  hasNode: boolean,
): boolean {
  if (isEditMode) return isSeeded || isValidName;
  return isValidName && hasNode;
}

function computeDisplayNameError(
  attempted: boolean,
  touched: boolean,
  hasName: boolean,
  nameError: string | null,
): string | null {
  if (nameError === null) return null;
  if (attempted || (touched && hasName)) return nameError;
  return null;
}

function resolveSubmitName(
  isSeeded: boolean,
  targetName: string | undefined,
  trimmed: string,
): string {
  if (isSeeded && typeof targetName === 'string') return targetName;
  return formatUserType(trimmed);
}

function resolveDescription(desc: string): string | null {
  const trimmed = desc.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function useAddUserTypeCardForm({
  editTarget,
  name,
  onNameChange,
  selectedNodeName,
  existingNames,
  onSubmit,
  onReset,
}: UseAddUserTypeCardFormParams): UseAddUserTypeCardFormReturn {
  const isEditMode = typeof editTarget?.id === 'string';
  const isSeeded = Boolean(editTarget?.isDefault);
  const initial = resolveInitialValues(editTarget);

  const [description, setDescription] = useState(initial.description);
  const [isAdmin, setIsAdmin] = useState(initial.isAdmin);
  const [canLogin, setCanLogin] = useState(initial.canLogin);
  const [dataAccessScope, setDataAccessScope] = useState<DataAccessScope>(
    initial.dataAccessScope,
  );
  const [touched, setTouched] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const trimmed = name.trim();
  const nameError = isSeeded
    ? null
    : validateName(trimmed, existingNames, editTarget?.name);
  const isValidName = trimmed.length > 0 && nameError === null;
  const isFormValid = computeFormValid(
    isEditMode,
    isSeeded,
    isValidName,
    selectedNodeName !== null,
  );
  const displayNameError = computeDisplayNameError(
    attemptedSubmit,
    touched,
    trimmed.length > 0,
    nameError,
  );

  const handleFormSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!isSeeded && nameError !== null) return;
    if (!isEditMode && selectedNodeName === null) return;

    onSubmit({
      name: resolveSubmitName(isSeeded, editTarget?.name, trimmed),
      description: resolveDescription(description),
      isAdmin,
      canLogin,
      dataAccessScope,
    });
  };

  const handleReset = (): void => {
    onNameChange('');
    setDescription('');
    setIsAdmin(false);
    setCanLogin(true);
    setDataAccessScope(0);
    setTouched(false);
    setAttemptedSubmit(false);
    onReset();
  };

  return {
    isEditMode,
    isSeeded,
    description,
    setDescription,
    isAdmin,
    setIsAdmin,
    canLogin,
    setCanLogin,
    dataAccessScope,
    setDataAccessScope,
    touched,
    setTouched,
    attemptedSubmit,
    isFormValid,
    displayNameError,
    handleFormSubmit,
    handleReset,
  };
}
