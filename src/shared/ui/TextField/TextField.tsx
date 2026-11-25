import {
  forwardRef,
  useId,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@shared/utils';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  readonly label: string;
  readonly error?: string | undefined;
  /** Shows a clear ("×") button when the field has a value; omit to keep the plain input. */
  readonly onClear?: (() => void) | undefined;
  readonly maxChars?: number | undefined;
}

const FieldLabelRow = ({
  id,
  label,
  required,
  maxChars,
  currentLength,
}: {
  readonly id: string;
  readonly label: string;
  readonly required: boolean | undefined;
  readonly maxChars: number | undefined;
  readonly currentLength: number;
}): ReactElement => (
  <div className={styles.labelRow}>
    <label className={styles.label} htmlFor={id}>
      {label}
      {required === true ? (
        <span className={styles.req} aria-hidden="true">
          {' '}
          *
        </span>
      ) : null}
    </label>
    {maxChars !== undefined ? (
      <span
        className={cn(styles.charCount, currentLength > maxChars && styles.charCountOver)}
        aria-label={`${String(currentLength)} of ${String(maxChars)} characters`}
      >
        {currentLength}/{maxChars}
      </span>
    ) : null}
  </div>
);

const ClearButton = ({
  label,
  onClear,
}: {
  readonly label: string;
  readonly onClear: () => void;
}): ReactElement => (
  <button
    type="button"
    className={styles.clearButton}
    onClick={onClear}
    aria-label={`Clear ${label}`}
  >
    <X size={14} aria-hidden="true" />
  </button>
);

/**
 * Tracks the character count of an input. Uncontrolled inputs (e.g. react-hook-form `register`)
 * get their initial/reset value programmatically after mount, so the real DOM value is read
 * whenever the value props change.
 */
const useInputLength = (
  inputRef: RefObject<HTMLInputElement | null>,
  initial: InputHTMLAttributes<HTMLInputElement>['value'],
): [number, Dispatch<SetStateAction<number>>] => {
  const [length, setLength] = useState<number>(() => String(initial ?? '').length);
  useLayoutEffect(() => {
    const actual = inputRef.current?.value.length;
    if (actual !== undefined) setLength(actual);
  }, [inputRef, initial]);
  return [length, setLength];
};

/**
 * Labelled text input with an inline error slot and optional character limit counter.
 * Forwards its `ref` to the underlying `<input>` so it drops straight into react-hook-form.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      required,
      maxChars,
      className,
      onClear,
      onChange,
      defaultValue,
      value,
      ...rest
    },
    ref,
  ): ReactElement => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = error !== undefined && error.length > 0;
    const showClear =
      onClear !== undefined && typeof value === 'string' && value.length > 0;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLInputElement | null): void => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) Object.assign(ref, { current: node });
      },
      [ref],
    );
    const [currentLength, setCurrentLength] = useInputLength(
      inputRef,
      value ?? defaultValue,
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      setCurrentLength(event.target.value.length);
      onChange?.(event);
    };

    return (
      <div className={styles.field}>
        <FieldLabelRow
          id={id}
          label={label}
          required={required}
          maxChars={maxChars}
          currentLength={currentLength}
        />
        <div className={styles.inputWrap}>
          <input
            id={id}
            ref={setRefs}
            className={cn(
              styles.input,
              hasError && styles.invalid,
              showClear && styles.hasClear,
              className,
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            defaultValue={defaultValue}
            value={value}
            onChange={handleChange}
            {...rest}
          />
          {showClear ? <ClearButton label={label} onClear={onClear} /> : null}
        </div>
        {hasError ? (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
