import type { ReactElement } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { isValidHttpUrl } from '@shared/utils';
import { BaseLessonFields, type BaseLessonFieldsProps } from './BaseLessonFields';
import { TextField } from '@shared/ui';

interface LinkPreviewCardProps {
  readonly title?: string | undefined;
  readonly externalUrl: string;
}

const LinkPreviewCard = ({ title, externalUrl }: LinkPreviewCardProps): ReactElement => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 1.15rem',
      backgroundColor: 'var(--color-surface-hover)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Globe size={18} style={{ color: 'var(--color-primary)' }} />
      <div>
        <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>
          {title ?? 'External Link'}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            wordBreak: 'break-all',
          }}
        >
          {externalUrl}
        </p>
      </div>
    </div>
    <a
      href={externalUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.4rem 0.75rem',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text)',
        fontSize: '0.85rem',
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      <ExternalLink size={14} /> Test Link
    </a>
  </div>
);

export const LinkLessonForm = ({
  draft,
  setDraft,
}: BaseLessonFieldsProps): ReactElement => {
  const hasUrl = Boolean(draft.externalUrl?.trim());
  const urlLength = (draft.externalUrl ?? '').length;
  const isInvalidUrl = hasUrl && !isValidHttpUrl(draft.externalUrl);

  const getUrlError = (): string | undefined => {
    if (urlLength > 1000) {
      return 'External URL must not exceed 1000 characters.';
    }
    if (isInvalidUrl) {
      return 'Please enter a valid URL starting with http:// or https://';
    }
    return undefined;
  };

  return (
    <>
      <BaseLessonFields draft={draft} setDraft={setDraft} showDuration={false} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <TextField
          label="External Web Resource URL"
          placeholder="https://example.com/resource"
          type="url"
          value={draft.externalUrl ?? ''}
          maxChars={1000}
          error={getUrlError()}
          onChange={(e) => {
            const val = e.target.value;
            setDraft((d) => ({ ...d, externalUrl: val }));
          }}
        />

        {hasUrl && Boolean(draft.externalUrl) && isValidHttpUrl(draft.externalUrl) && (
          <LinkPreviewCard
            title={draft.title ?? undefined}
            externalUrl={draft.externalUrl ?? ''}
          />
        )}
      </div>
    </>
  );
};
