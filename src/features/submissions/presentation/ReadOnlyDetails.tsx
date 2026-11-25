/* eslint-disable max-lines-per-function, complexity */
import { type ReactElement } from 'react';
import { useDraftEditor } from './use-draft-editor';
import {
  formatDuration,
  getDifficultyLabel,
  getVisibilityLabel,
} from './read-only-formatters';
import { ReadOnlyMetadataItem } from './ReadOnlyMetadataItem';
import { ReadOnlyAudienceReach } from './ReadOnlyAudienceReach';
import { ThumbnailUploadField } from './ThumbnailUploadField';

export interface ReadOnlyDetailsProps {
  readonly categoryName?: string | undefined;
}

export const ReadOnlyDetails = ({ categoryName }: ReadOnlyDetailsProps): ReactElement => {
  const { contentTypeKey, draftState, content, contentId } = useDraftEditor();
  const d = draftState.details;

  const typeHeader =
    contentTypeKey === 'course'
      ? 'Course Overview & Metadata'
      : contentTypeKey === 'tutorial'
        ? 'Tutorial Overview & Metadata'
        : 'Resource Overview & Metadata';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 0.35rem 0' }}>
          {typeHeader}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Review the metadata and configuration submitted for this {contentTypeKey}.
        </p>
      </div>

      {/* Main Title & Description Card */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-subtle)',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              marginBottom: '0.5rem',
            }}
          >
            {contentTypeKey.toUpperCase()}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
            {d.title.length > 0 ? d.title : 'Untitled Submission'}
          </h2>
          {d.subtitle && (
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              {d.subtitle}
            </p>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <h4
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0',
            }}
          >
            Description
          </h4>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: 'var(--color-text)',
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {d.description ?? 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Structured Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <ReadOnlyMetadataItem label="Category" value={categoryName ?? 'Unassigned'} />
        <ReadOnlyMetadataItem label="Difficulty">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor:
                d.difficulty === 10
                  ? 'var(--color-danger-subtle)'
                  : d.difficulty === 5
                    ? 'var(--color-warning-subtle)'
                    : 'var(--color-success-subtle)',
              color:
                d.difficulty === 10
                  ? 'var(--color-danger)'
                  : d.difficulty === 5
                    ? 'var(--color-warning)'
                    : 'var(--color-success)',
            }}
          >
            {getDifficultyLabel(d.difficulty)}
          </span>
        </ReadOnlyMetadataItem>
        <ReadOnlyMetadataItem
          label="Estimated Duration"
          value={formatDuration(d.durationSeconds)}
        />
        <ReadOnlyMetadataItem label="Topic" value={d.topic} />
        <ReadOnlyMetadataItem label="Language" value={d.language ?? 'English'} />
        <ReadOnlyMetadataItem
          label="Access Visibility"
          value={getVisibilityLabel(d.visibility)}
        />
      </div>

      {/* Target Audience Reach */}
      <ReadOnlyAudienceReach
        visibility={d.visibility}
        branchIds={d.branchIds}
        teamIds={d.teamIds}
      />

      {/* Tags & Keywords */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div>
          <h4
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0',
            }}
          >
            Content Tags ({draftState.tags.length})
          </h4>
          {draftState.tags.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {draftState.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              No tags attached.
            </span>
          )}
        </div>

        {d.keywords && (
          <div
            style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}
          >
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                margin: '0 0 0.35rem 0',
              }}
            >
              Search Keywords
            </h4>
            <p
              style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}
            >
              {d.keywords}
            </p>
          </div>
        )}

        <div
          style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}
        >
          <ThumbnailUploadField
            contentId={contentId}
            liveThumbnailUrl={content.thumbnailUrl}
            draftMedia={draftState.media}
            thumbnailAlt={d.thumbnailAlt ?? ''}
            onAltChange={() => undefined}
            onMediaUpdate={() => undefined}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
