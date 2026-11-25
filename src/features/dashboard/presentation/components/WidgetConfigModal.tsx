import { useEffect, useState, type ReactElement } from 'react';
import { Button, Modal, Select, Switch, TextField } from '@shared/ui';
import type { WidgetConfigField, WidgetInstance } from '../../domain';
import styles from './WidgetConfigModal.module.css';

export interface WidgetConfigModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly instance: WidgetInstance;
  readonly onSave: (config: Record<string, unknown>) => void;
}

function safeStringVal(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
}

interface FieldInputProps {
  readonly field: WidgetConfigField;
  readonly value: unknown;
  readonly error?: string | undefined;
  readonly onChange: (key: string, val: unknown) => void;
}

const ConfigFieldInput = ({
  field,
  value,
  error,
  onChange,
}: FieldInputProps): ReactElement => {
  const rawVal = value ?? field.defaultValue ?? '';

  if (field.type === 'boolean') {
    return (
      <div className={styles.switchRow}>
        <span className={styles.switchLabel}>
          {field.label}
          {field.required ? ' *' : ''}
        </span>
        <Switch
          label={field.label}
          checked={Boolean(rawVal)}
          onChange={(checked) => {
            onChange(field.key, checked);
          }}
        />
      </div>
    );
  }

  if (field.type === 'select' && field.options && field.options.length > 0) {
    const selectOptions = field.options.map((opt) => ({
      value: String(opt.value),
      label: opt.label,
    }));
    return (
      <Select
        label={field.label}
        value={safeStringVal(rawVal)}
        onChange={(val) => {
          const original = field.options?.find((opt) => String(opt.value) === val);
          onChange(field.key, original ? original.value : val);
        }}
        options={selectOptions}
        error={error}
      />
    );
  }

  return (
    <TextField
      label={field.label}
      required={field.required}
      type={field.type === 'number' ? 'number' : 'text'}
      value={safeStringVal(rawVal)}
      error={error}
      onChange={(e) => {
        onChange(
          field.key,
          field.type === 'number' ? Number(e.target.value) : e.target.value,
        );
      }}
    />
  );
};

function validateConfig(
  schema: readonly WidgetConfigField[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of schema) {
    const val = values[field.key];
    const isEmpty = val === undefined || val === null || val === '';
    if (field.required && isEmpty) {
      errors[field.key] = `${field.label} is required`;
    } else if (field.type === 'number' && !isEmpty && isNaN(Number(val))) {
      errors[field.key] = `${field.label} must be a valid number`;
    }
  }
  return errors;
}

function useWidgetConfigForm(
  instance: WidgetInstance,
  open: boolean,
  onSave: (config: Record<string, unknown>) => void,
  onOpenChange: (open: boolean) => void,
): {
  readonly values: Record<string, unknown>;
  readonly errors: Record<string, string>;
  readonly handleChange: (key: string, val: unknown) => void;
  readonly handleSave: () => void;
} {
  const initialConfig =
    typeof instance.config === 'object' && instance.config !== null
      ? (instance.config as Record<string, unknown>)
      : {};

  const [values, setValues] = useState<Record<string, unknown>>(initialConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(
        typeof instance.config === 'object' && instance.config !== null
          ? (instance.config as Record<string, unknown>)
          : {},
      );
      setErrors({});
    }
  }, [open, instance.config]);

  const handleChange = (key: string, val: unknown): void => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const { [key]: _omit, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = (): void => {
    const nextErrors = validateConfig(instance.configSchema, values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave(values);
    onOpenChange(false);
  };

  return { values, errors, handleChange, handleSave };
}

export const WidgetConfigModal = ({
  open,
  onOpenChange,
  instance,
  onSave,
}: WidgetConfigModalProps): ReactElement => {
  const { values, errors, handleChange, handleSave } = useWidgetConfigForm(
    instance,
    open,
    onSave,
    onOpenChange,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Configure — ${instance.displayName}`}
      description="Customize options for this widget tile."
      footer={
        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
            Save settings
          </Button>
        </div>
      }
    >
      <div className={styles.form}>
        {instance.configSchema.length === 0 ? (
          <p className={styles.emptyHint}>This widget has no configurable settings.</p>
        ) : (
          instance.configSchema.map((field) => (
            <ConfigFieldInput
              key={field.key}
              field={field}
              value={values[field.key]}
              error={errors[field.key]}
              onChange={handleChange}
            />
          ))
        )}
      </div>
    </Modal>
  );
};
