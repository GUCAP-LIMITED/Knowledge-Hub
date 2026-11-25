/* eslint-disable max-lines-per-function */
import type { ReactElement } from 'react';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';

export interface CatalogCardPreviewProps {
  readonly title: string;
  readonly subtitle?: string | null | undefined;
  readonly categoryName?: string | undefined;
  readonly difficultyLabel: string;
  readonly durationText: string;
  readonly sectionsCount: number;
  readonly lessonsCount: number;
  readonly author: string;
  readonly contentType: string;
}

export const CatalogCardPreview = ({
  title,
  subtitle,
  categoryName,
  difficultyLabel,
  durationText,
  sectionsCount,
  lessonsCount,
  author,
  contentType,
}: CatalogCardPreviewProps): ReactElement => (
  <div
    style={{
      width: '100%',
      maxWidth: '380px',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Card Hero */}
    <div
      style={{
        height: '170px',
        backgroundColor: 'var(--color-surface-sunken)',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(79,70,229,0.25))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <PlayCircle size={48} style={{ color: 'var(--color-primary)', opacity: 0.85 }} />
      <span
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255,255,255,0.85)',
          color: 'var(--color-primary)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {contentType}
      </span>
    </div>

    {/* Card Body */}
    <div
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: 1,
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categoryName && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
            }}
          >
            {categoryName}
          </span>
        )}
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text-muted)',
          }}
        >
          {difficultyLabel}
        </span>
      </div>

      <div>
        <h4
          style={{
            margin: '0 0 0.35rem 0',
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'var(--color-text)',
          }}
        >
          {title ? title : 'Untitled Content'}
        </h4>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} /> {durationText}
        </span>
        {sectionsCount > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={13} /> {lessonsCount} lessons
          </span>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        By <strong>{author}</strong>
      </div>
    </div>
  </div>
);
