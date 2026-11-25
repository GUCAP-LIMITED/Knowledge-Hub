import { useId, type ReactElement } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@shared/utils';
import styles from './Select.module.css';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps {
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly name?: string;
  readonly error?: string | undefined;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  /** Keeps the label in the accessibility tree (still announced, still the trigger's accessible
   * name) but hides it visually — for compact toolbars where the control's current value and
   * icon already communicate its purpose. */
  readonly hideLabel?: boolean;
}

const SelectOptionItem = ({
  option,
}: {
  readonly option: SelectOption;
}): ReactElement => (
  <RadixSelect.Item
    value={option.value}
    className={styles.item}
    {...(option.disabled !== undefined ? { disabled: option.disabled } : {})}
  >
    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator className={styles.indicator}>
      <Check size={14} aria-hidden="true" />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
);

/** `RadixSelect.Value` doesn't forward `className` to its rendered span, so the truncation
 * styles go on this wrapper instead — it stays part of the same inline formatting context, so
 * `text-overflow: ellipsis` still applies correctly. Split out so `Select` stays within the
 * file's function-size limit. */
const SelectTriggerContent = ({
  placeholder,
}: {
  readonly placeholder: string | undefined;
}): ReactElement => (
  <>
    <span className={styles.value}>
      <RadixSelect.Value placeholder={placeholder} />
    </span>
    <RadixSelect.Icon className={styles.icon}>
      <ChevronDown size={16} aria-hidden="true" />
    </RadixSelect.Icon>
  </>
);

/** Labelled Radix-based select with an inline error slot. Content opens in a portal below the trigger. */
export const Select = ({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  name,
  error,
  required,
  disabled,
  className,
  hideLabel,
}: SelectProps): ReactElement => {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = error !== undefined && error.length > 0;
  return (
    <div className={styles.field}>
      <label
        className={cn(styles.label, hideLabel === true && styles.visuallyHidden)}
        htmlFor={id}
      >
        {label}
        {required === true ? (
          <span className={styles.req} aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <RadixSelect.Root
        value={value}
        onValueChange={onChange}
        onOpenChange={(open) => {
          if (!open) {
            onBlur?.();
          }
        }}
        {...(name !== undefined ? { name } : {})}
        {...(disabled !== undefined ? { disabled } : {})}
      >
        <RadixSelect.Trigger
          id={id}
          className={cn(styles.trigger, hasError && styles.invalid, className)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        >
          <SelectTriggerContent placeholder={placeholder} />
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className={styles.content}
            position="popper"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <RadixSelect.Viewport className={styles.viewport}>
              {options.map((option) => (
                <SelectOptionItem key={option.value} option={option} />
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {hasError ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
};
