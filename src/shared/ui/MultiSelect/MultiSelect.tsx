/* eslint-disable max-lines-per-function, complexity */
import { useState, useId, useMemo, type ReactElement, type MouseEvent } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@shared/utils';
import styles from './MultiSelect.module.css';

export interface MultiSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface MultiSelectProps {
  readonly label: string;
  readonly options: readonly MultiSelectOption[];
  readonly value: readonly string[];
  readonly onChange: (value: string[]) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly name?: string;
  readonly error?: string | undefined;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly allLabel?: string;
  readonly selectAllLabel?: string;
  readonly className?: string;
}

interface TriggerBadgesProps {
  readonly value: readonly string[];
  readonly options: readonly MultiSelectOption[];
  readonly placeholder: string;
  readonly allLabel?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly selectedLabelsMap: Map<string, string>;
  readonly onRemoveSingle: (e: MouseEvent, val: string) => void;
}

const TriggerBadges = ({
  value,
  options,
  placeholder,
  allLabel,
  selectedLabelsMap,
  onRemoveSingle,
}: TriggerBadgesProps): ReactElement => {
  const isAllSelected = options.length > 0 && value.length === options.length;

  if (value.length === 0) {
    return <span className={styles.placeholder}>{placeholder}</span>;
  }

  if (Boolean(allLabel) && isAllSelected && options.length > 1) {
    return <span className={cn(styles.tag, styles.allTag)}>{allLabel}</span>;
  }

  return (
    <>
      {value.map((val) => {
        const optLabel = selectedLabelsMap.get(val) ?? val;
        return (
          <span key={val} className={styles.tag}>
            {optLabel}
            <button
              type="button"
              className={styles.tagRemove}
              onClick={(e) => {
                onRemoveSingle(e, val);
              }}
              aria-label={`Remove ${optLabel}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        );
      })}
    </>
  );
};

export const MultiSelect = ({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select options…',
  error,
  required,
  disabled,
  allLabel,
  selectAllLabel = 'Select All',
  className,
}: MultiSelectProps): ReactElement => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const hasError = error !== undefined && error.length > 0;
  const isAllSelected = options.length > 0 && value.length === options.length;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search]);

  const toggleOption = (optionValue: string): void => {
    if (disabled) return;
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeSingle = (e: MouseEvent, optionValue: string): void => {
    e.stopPropagation();
    if (disabled) return;
    onChange(value.filter((v) => v !== optionValue));
  };

  const toggleSelectAll = (): void => {
    if (disabled) return;
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.filter((o) => !o.disabled).map((o) => o.value));
    }
  };

  const clearAll = (e: MouseEvent): void => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  const selectedLabelsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of options) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [options]);

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required === true ? (
          <span className={styles.req} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <RadixPopover.Root
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
          if (!next && onBlur) onBlur();
        }}
      >
        <RadixPopover.Trigger asChild>
          <button
            id={id}
            type="button"
            className={cn(styles.trigger, hasError && styles.invalid)}
            data-disabled={disabled ? '' : undefined}
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <div className={styles.triggerContent}>
              <TriggerBadges
                value={value}
                options={options}
                placeholder={placeholder}
                allLabel={allLabel}
                disabled={disabled}
                selectedLabelsMap={selectedLabelsMap}
                onRemoveSingle={removeSingle}
              />
            </div>

            <div className={styles.actions}>
              {value.length > 0 && !disabled ? (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearAll}
                  aria-label="Clear all selections"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : null}
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </button>
        </RadixPopover.Trigger>

        <RadixPopover.Portal>
          <RadixPopover.Content
            className={styles.popoverContent}
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {options.length > 5 ? (
              <div className={styles.searchWrapper}>
                <Search size={14} className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </div>
            ) : null}

            <div className={styles.toolbar}>
              <span>
                {value.length} of {options.length} selected
              </span>
              <button
                type="button"
                className={styles.toolbarBtn}
                onClick={toggleSelectAll}
              >
                {isAllSelected ? 'Clear All' : selectAllLabel}
              </button>
            </div>

            <div
              className={styles.optionsList}
              role="listbox"
              aria-multiselectable="true"
            >
              {filteredOptions.length === 0 ? (
                <div className={styles.emptyOptions}>No options found</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      data-disabled={opt.disabled}
                      className={styles.optionItem}
                      onClick={() => {
                        if (!opt.disabled) {
                          toggleOption(opt.value);
                        }
                      }}
                    >
                      <div className={styles.checkboxBox}>
                        {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                      </div>
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>

      {hasError ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
};
