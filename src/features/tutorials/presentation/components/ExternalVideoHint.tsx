import { type ReactElement } from 'react';
import { ExternalLink } from 'lucide-react';

const getDomain = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'External Source';
  }
};

export interface ExternalVideoHintProps {
  readonly url: string;
  readonly title: string;
}

export const ExternalVideoHint = ({
  url,
  title,
}: ExternalVideoHintProps): ReactElement => (
  <div
    style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      border: '2px dashed var(--color-border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-sunken)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.85rem',
    }}
  >
    <div
      style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary-subtle, rgba(59, 130, 246, 0.1))',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ExternalLink size={26} />
    </div>
    <div>
      <h5 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600 }}>
        {title}
      </h5>
      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          maxWidth: '320px',
        }}
      >
        This video part is hosted externally at <strong>{getDomain(url)}</strong>. Click
        below to open the stream directly in a new tab.
      </p>
    </div>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'none',
        marginTop: '0.25rem',
      }}
    >
      <ExternalLink size={15} />
      Open in New Tab
    </a>
  </div>
);
