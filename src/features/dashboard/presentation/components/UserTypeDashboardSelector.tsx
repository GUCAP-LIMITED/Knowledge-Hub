import type { ReactElement } from 'react';
import { useSelectableUserTypes } from '@features/user-types';
import { Select } from '@shared/ui';
import { formatUserType } from '@shared/utils';

export interface UserTypeDashboardSelectorProps {
  readonly value: string | null;
  readonly onChange: (userTypeId: string | null, userTypeName: string | null) => void;
  readonly disabled?: boolean;
  readonly includePersonal?: boolean;
  readonly label?: string;
  readonly placeholder?: string;
  readonly hideLabel?: boolean;
}

const MY_VIEW_VALUE = '__my_view__';

export const UserTypeDashboardSelector = ({
  value,
  onChange,
  disabled = false,
  includePersonal = false,
  label = 'User Type',
  placeholder = 'View by user type',
  hideLabel = false,
}: UserTypeDashboardSelectorProps): ReactElement => {
  const query = useSelectableUserTypes(false);
  const items = query.data ?? [];

  const baseOptions = items.map((type) => ({
    value: type.id,
    label: formatUserType(type.name),
  }));

  const options = includePersonal
    ? [{ value: MY_VIEW_VALUE, label: 'My view' }, ...baseOptions]
    : baseOptions;

  const currentValue = includePersonal ? (value ?? MY_VIEW_VALUE) : (value ?? '');

  const handleChange = (selected: string): void => {
    if (selected === MY_VIEW_VALUE) {
      onChange(null, null);
    } else {
      const match = items.find((item) => item.id === selected);
      onChange(selected, match?.name ?? null);
    }
  };

  return (
    <Select
      label={label}
      value={currentValue}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      hideLabel={hideLabel}
      disabled={disabled || query.isPending}
    />
  );
};
