import { useId, useState, type ReactElement } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import styles from './AuthField.module.css';

export interface AuthFieldProps {
  readonly label: string;
  readonly icon: LucideIcon;
  /** `password` renders a show/hide toggle. */
  readonly type: 'email' | 'password' | 'text';
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly autoComplete?: string;
  readonly required?: boolean;
}

/** SSO-styled auth input: a pill field with a leading icon and, for passwords, a reveal toggle. */
export const AuthField = ({
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: AuthFieldProps): ReactElement => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && revealed ? 'text' : type;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control}>
        <Icon size={18} aria-hidden="true" className={styles.leadingIcon} />
        <input
          id={id}
          className={styles.input}
          type={inputType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.toggle}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            onClick={() => {
              setRevealed((current) => !current);
            }}
          >
            {revealed ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
};
