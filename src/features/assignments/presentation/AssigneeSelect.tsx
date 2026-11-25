import { useState, type ReactElement } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover } from '@shared/ui';
import { cn, formatUserType } from '@shared/utils';
import { useTeams } from '@features/teams';
import { useSelectableUserTypes } from '@features/user-types';
import type { AssignableUser, AssigneeCategory } from '../domain';
import { UserSearchMenu } from './UserSearchMenu';
import styles from './AssigneeSelect.module.css';

export interface AssigneeSelection {
  readonly category: AssigneeCategory;
  readonly targetId: string;
  readonly displayName: string;
  readonly email?: string | undefined;
}

interface CategoryOption {
  readonly category: AssigneeCategory;
  readonly label: string;
}

const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { category: 'user', label: 'User' },
  { category: 'team', label: 'Team' },
  { category: 'userType', label: 'User Type' },
];

const categoryLabel = (category: AssigneeCategory): string => {
  const option = CATEGORY_OPTIONS.find((candidate) => candidate.category === category);
  return option === undefined ? category : option.label;
};

interface ValueOption {
  readonly targetId: string;
  readonly displayName: string;
}

interface CategoryOptions {
  readonly loading: boolean;
  readonly options: readonly ValueOption[];
}

const optionsForCategory = (
  category: AssigneeCategory,
  teams: readonly { readonly id: string; readonly name: string }[] | undefined,
  userTypes: readonly { readonly id: string; readonly name: string }[] | undefined,
): CategoryOptions => {
  if (category === 'team') {
    return teams === undefined
      ? { loading: true, options: [] }
      : {
          loading: false,
          options: teams.map((team) => ({ targetId: team.id, displayName: team.name })),
        };
  }
  if (category === 'userType') {
    return userTypes === undefined
      ? { loading: true, options: [] }
      : {
          loading: false,
          options: userTypes.map((userType) => ({
            targetId: userType.id,
            displayName: formatUserType(userType.name),
          })),
        };
  }
  return { loading: false, options: [] };
};

const valueLabel = (displayName: string): string =>
  displayName.length === 0 ? 'Select assignee…' : displayName;

const CategoryMenu = ({
  currentCategory,
  onPickCategory,
}: {
  readonly currentCategory: AssigneeCategory;
  readonly onPickCategory: (category: AssigneeCategory) => void;
}): ReactElement => (
  <div className={styles.menu}>
    {CATEGORY_OPTIONS.map((option) => (
      <button
        key={option.category}
        type="button"
        className={styles.item}
        onClick={() => {
          onPickCategory(option.category);
        }}
      >
        <span>{option.label}</span>
        <span className={cn(styles.check, styles.chevron)}>
          {option.category === currentCategory ? (
            <Check size={14} aria-hidden="true" />
          ) : null}
          <ChevronRight size={14} aria-hidden="true" />
        </span>
      </button>
    ))}
  </div>
);

const ValueMenu = ({
  category,
  options,
  selectedTargetId,
  disabledTargetIds,
  onBack,
  onPickValue,
}: {
  readonly category: AssigneeCategory;
  readonly options: CategoryOptions;
  readonly selectedTargetId: string;
  readonly disabledTargetIds?: ReadonlySet<string> | undefined;
  readonly onBack: () => void;
  readonly onPickValue: (targetId: string, displayName: string) => void;
}): ReactElement => {
  const label = categoryLabel(category);
  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack}>
          <ChevronLeft size={14} aria-hidden="true" />
          <span>
            Categories · <span className={styles.headerCategory}>{label}</span>
          </span>
        </button>
      </div>
      {options.loading ? (
        <div className={styles.itemEmpty}>Loading {label.toLowerCase()}…</div>
      ) : options.options.length === 0 ? (
        <div className={styles.itemEmpty}>No {label.toLowerCase()} available</div>
      ) : (
        options.options.map((option) => {
          const isSelected = option.targetId === selectedTargetId;
          const isDisabled = disabledTargetIds?.has(option.targetId) ?? false;
          return (
            <button
              key={option.targetId}
              type="button"
              className={styles.item}
              disabled={isDisabled}
              title={isDisabled ? 'Already assigned' : undefined}
              onClick={() => {
                if (!isDisabled) {
                  onPickValue(option.targetId, option.displayName);
                }
              }}
            >
              <span>{option.displayName}</span>
              <span className={styles.check}>
                {isSelected ? <Check size={14} aria-hidden="true" /> : null}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
};

interface AssigneeMenuProps {
  readonly pickedCategory: AssigneeCategory | null;
  readonly currentCategory: AssigneeCategory;
  readonly options: CategoryOptions;
  readonly selectedTargetId: string;
  readonly disabledTargetIds?: ReadonlySet<string> | undefined;
  readonly onPickCategory: (category: AssigneeCategory) => void;
  readonly onBack: () => void;
  readonly onPickUser: (user: AssignableUser) => void;
  readonly onPickValue: (targetId: string, displayName: string) => void;
}

const AssigneeMenu = ({
  pickedCategory,
  currentCategory,
  options,
  selectedTargetId,
  disabledTargetIds,
  onPickCategory,
  onBack,
  onPickUser,
  onPickValue,
}: AssigneeMenuProps): ReactElement => {
  if (pickedCategory === null) {
    return (
      <CategoryMenu currentCategory={currentCategory} onPickCategory={onPickCategory} />
    );
  }

  if (pickedCategory === 'user') {
    return (
      <UserSearchMenu
        selectedTargetId={selectedTargetId}
        disabledTargetIds={disabledTargetIds}
        onBack={onBack}
        onPickUser={onPickUser}
      />
    );
  }

  return (
    <ValueMenu
      category={pickedCategory}
      options={options}
      selectedTargetId={selectedTargetId}
      disabledTargetIds={disabledTargetIds}
      onBack={onBack}
      onPickValue={onPickValue}
    />
  );
};

export interface AssigneeSelectProps {
  readonly value: AssigneeSelection;
  readonly disabledTargetIds?: ReadonlySet<string> | undefined;
  readonly onChange: (selection: AssigneeSelection) => void;
}

export const AssigneeSelect = ({
  value,
  disabledTargetIds,
  onChange,
}: AssigneeSelectProps): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);
  const [pickedCategory, setPickedCategory] = useState<AssigneeCategory | null>(null);

  const { data: teams } = useTeams();
  const { data: userTypes } = useSelectableUserTypes(false);

  const options: CategoryOptions =
    pickedCategory === null
      ? { loading: false, options: [] }
      : optionsForCategory(pickedCategory, teams, userTypes);

  const selectedTargetId = pickedCategory === value.category ? value.targetId : '';

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen);
    if (nextOpen) {
      setPickedCategory(null);
    }
  };

  const handlePickUser = (user: AssignableUser): void => {
    const full = `${user.name} ${user.surname}`.trim();
    const displayName = full.length > 0 ? full : user.userName;
    onChange({
      category: 'user',
      targetId: user.id,
      displayName,
      email: user.email,
    });
    setOpen(false);
  };

  const handlePickValue = (targetId: string, displayName: string): void => {
    if (pickedCategory !== null) {
      onChange({ category: pickedCategory, targetId, displayName });
    }
    setOpen(false);
  };

  const trigger = (
    <button type="button" className={styles.trigger}>
      <span className={cn(value.displayName.length === 0 && styles.placeholder)}>
        {valueLabel(value.displayName)}
      </span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
  );

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      align="start"
      modal={true}
    >
      <AssigneeMenu
        pickedCategory={pickedCategory}
        currentCategory={value.category}
        options={options}
        selectedTargetId={selectedTargetId}
        disabledTargetIds={disabledTargetIds}
        onPickCategory={setPickedCategory}
        onBack={() => {
          setPickedCategory(null);
        }}
        onPickUser={handlePickUser}
        onPickValue={handlePickValue}
      />
    </Popover>
  );
};
