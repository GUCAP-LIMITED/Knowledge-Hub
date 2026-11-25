import { type ReactElement } from 'react';

export const ReadOnlyMetadataItem = ({
  label,
  value,
  children,
}: {
  readonly label: string;
  readonly value?: string | number | null;
  readonly children?: ReactElement | null;
}): ReactElement => (
  <div
    style={{
      padding: '0.85rem 1rem',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}
  >
    <span
      style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-muted)',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
    {children ?? (
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 500,
          color: value ? 'var(--color-text)' : 'var(--color-text-muted)',
        }}
      >
        {value ?? 'None'}
      </span>
    )}
  </div>
);
