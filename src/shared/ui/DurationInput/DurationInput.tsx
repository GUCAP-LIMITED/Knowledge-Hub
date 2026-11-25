/* eslint-disable max-lines-per-function, complexity */
import {
  forwardRef,
  useId,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactElement,
} from 'react';
import { Clock, X } from 'lucide-react';
import { cn, DURATION_INPUT_PATTERN } from '@shared/utils';
import { useDurationDraft, type DurationValue } from './use-duration-draft';
import styles from './DurationInput.module.css';

export type { DurationValue };

export interface DurationInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'id'
> {
  readonly id?: string;
  readonly label?: string;
  readonly error?: string | undefined;
  readonly helperText?: string | undefined;
  readonly required?: boolean;
  /**
   * 'seconds': output/input numeric seconds (e.g. 3902).
   * 'string': output/input formatted duration string (e.g. "1h 5m 2s").
   * Default: auto-detected from typeof value, or 'seconds'.
   */
  readonly mode?: 'seconds' | 'string';
  readonly value?: DurationValue | undefined;
  readonly onChange?: (value: DurationValue, totalSeconds: number) => void;
  readonly onClear?: (() => void) | undefined;
  /** Maximum duration allowed in seconds (default: 360,000 = 100 hours) */
  readonly maxSeconds?: number;
  /** Whether to show a live canonical translation badge (default: true) */
  readonly showLiveBadge?: boolean;
  /** Optional quick preset pills (e.g. ['15m', '30m', '45m', '1h']) */
  readonly presets?: readonly string[];
}

interface LabelRowProps {
  readonly label?: string | undefined;
  readonly inputId: string;
  readonly required?: boolean | undefined;
  readonly showLiveBadge: boolean;
  readonly hasLiveDifference: boolean;
  readonly canonicalText: string;
  readonly totalSeconds: number;
}

const LabelRow = ({
  label,
  inputId,
  required,
  showLiveBadge,
  hasLiveDifference,
  canonicalText,
  totalSeconds,
}: LabelRowProps): ReactElement | null => {
  if (label === undefined && (!showLiveBadge || !hasLiveDifference)) {
    return null;
  }

  return (
    <div className={styles.labelRow}>
      {label !== undefined ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required === true && (
            <span className={styles.req} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      ) : (
        <span />
      )}

      {showLiveBadge && hasLiveDifference && (
        <span
          className={styles.previewBadge}
          title={`${totalSeconds.toLocaleString()} total seconds`}
          aria-live="polite"
        >
          = {canonicalText}
        </span>
      )}
    </div>
  );
};

interface PresetsRowProps {
  readonly presets?: readonly string[] | undefined;
  readonly disabled?: boolean | undefined;
  readonly onSelect: (preset: string) => void;
}

const PresetsRow = ({
  presets,
  disabled,
  onSelect,
}: PresetsRowProps): ReactElement | null => {
  if (presets === undefined || presets.length === 0 || disabled === true) {
    return null;
  }

  return (
    <div className={styles.presetsRow} aria-label="Duration presets">
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          className={styles.presetPill}
          onClick={() => {
            onSelect(preset);
          }}
        >
          {preset}
        </button>
      ))}
    </div>
  );
};

export const DurationInput = forwardRef<HTMLInputElement, DurationInputProps>(
  (
    {
      id: customId,
      label,
      error,
      helperText,
      required,
      disabled,
      mode,
      value,
      placeholder = 'e.g. 15m, 1h 30m, 45s',
      onChange,
      onClear,
      onBlur,
      maxSeconds: _maxSeconds,
      showLiveBadge = true,
      presets,
      className,
      ...rest
    },
    ref,
  ): ReactElement => {
    const generatedId = useId();
    const inputId = customId ?? generatedId;
    const errorId = `${inputId}-error`;
    const resolvedMode = mode ?? (typeof value === 'number' ? 'seconds' : 'string');

    const draft = useDurationDraft({
      value,
      resolvedMode,
      onChange,
    });

    const handleClearClick = (): void => {
      draft.handleClear();
      onClear?.();
    };

    const handleInputBlur = (e: FocusEvent<HTMLInputElement>): void => {
      draft.handleBlur();
      onBlur?.(e);
    };

    const hasError = error !== undefined && error.length > 0;
    const showClear = !disabled && draft.textValue.length > 0;

    return (
      <div className={cn(styles.field, className)}>
        <LabelRow
          label={label}
          inputId={inputId}
          required={required}
          showLiveBadge={showLiveBadge}
          hasLiveDifference={draft.hasLiveDifference}
          canonicalText={draft.canonicalText}
          totalSeconds={draft.totalSeconds}
        />

        <div className={styles.inputWrap}>
          <span className={styles.iconLeft} aria-hidden="true">
            <Clock size={16} />
          </span>
          <input
            {...rest}
            ref={ref}
            id={inputId}
            type="text"
            pattern={rest.pattern ?? DURATION_INPUT_PATTERN}
            disabled={disabled}
            value={draft.textValue}
            placeholder={placeholder}
            className={cn(
              styles.input,
              showClear && styles.hasClear,
              hasError && styles.invalid,
            )}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hasError ? errorId : undefined}
            onChange={draft.handleChange}
            onFocus={draft.handleFocus}
            onBlur={handleInputBlur}
          />
          {showClear && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearClick}
              aria-label={`Clear ${label ?? 'duration'}`}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {hasError && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}

        {helperText !== undefined && !hasError && (
          <span className={styles.helperText}>{helperText}</span>
        )}

        <PresetsRow
          presets={presets}
          disabled={disabled}
          onSelect={draft.handlePresetSelect}
        />
      </div>
    );
  },
);

DurationInput.displayName = 'DurationInput';
