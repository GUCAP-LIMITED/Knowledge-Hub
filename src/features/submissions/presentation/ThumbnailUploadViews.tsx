import type { ReactElement, DragEvent } from 'react';
import { UploadCloud, Clock, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button, Spinner, TextField } from '@shared/ui';
import styles from './ThumbnailUploadField.module.css';

export const ThumbnailHeader = (): ReactElement => (
  <div className={styles.header}>
    <h4 className={styles.headerTitle}>
      <ImageIcon size={18} aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
      Thumbnail Image
      <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>*</span>
    </h4>
    <span className={styles.metaText}>16:9 recommended · PNG, JPG, WebP (max 10MB)</span>
  </div>
);

interface BadgeOverlayProps {
  readonly isStagedBlob: boolean;
  readonly hasLiveMedia: boolean;
}

export const BadgeOverlay = ({
  isStagedBlob,
  hasLiveMedia,
}: BadgeOverlayProps): ReactElement | null => {
  if (isStagedBlob) {
    return (
      <div className={styles.badgeOverlay}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-warning)',
            backgroundColor: 'var(--color-warning-subtle)',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Clock size={12} aria-hidden="true" /> Staged in Draft (Pending Approval)
        </span>
      </div>
    );
  }

  if (hasLiveMedia) {
    return (
      <div className={styles.badgeOverlay}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-success)',
            backgroundColor: 'var(--color-success-subtle)',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <CheckCircle2 size={12} aria-hidden="true" /> Published Thumbnail
        </span>
      </div>
    );
  }

  return null;
};

interface PreviewViewProps {
  readonly activeThumbnailUrl: string;
  readonly thumbnailAlt: string;
  readonly isSasLoading: boolean;
  readonly isStagedBlob: boolean;
  readonly hasLiveMedia: boolean;
  readonly draftFileName?: string | null | undefined;
  readonly readOnly: boolean;
  readonly isUploading: boolean;
  readonly onTriggerUpload: () => void;
}

export const PreviewView = ({
  activeThumbnailUrl,
  thumbnailAlt,
  isSasLoading,
  isStagedBlob,
  hasLiveMedia,
  draftFileName,
  readOnly,
  isUploading,
  onTriggerUpload,
}: PreviewViewProps): ReactElement => {
  const altText = thumbnailAlt || 'Content thumbnail';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className={styles.previewWrapper}>
        {isSasLoading && isStagedBlob ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Spinner label="Loading draft thumbnail..." />
          </div>
        ) : (
          <img src={activeThumbnailUrl} alt={altText} className={styles.previewImage} />
        )}

        <BadgeOverlay isStagedBlob={isStagedBlob} hasLiveMedia={hasLiveMedia} />
      </div>

      {!readOnly && (
        <div className={styles.controlsRow}>
          <span className={styles.metaText}>
            {draftFileName
              ? `File: ${draftFileName}`
              : 'Click replace to upload a new thumbnail image.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTriggerUpload}
            disabled={isUploading}
          >
            <UploadCloud
              size={15}
              aria-hidden="true"
              style={{ marginRight: '0.35rem' }}
            />
            {isUploading ? 'Uploading to Staging...' : 'Replace Thumbnail'}
          </Button>
        </div>
      )}
    </div>
  );
};

interface DropzoneViewProps {
  readonly isUploading: boolean;
  readonly isDragOver: boolean;
  readonly onDragOver: (e: DragEvent<HTMLLabelElement>) => void;
  readonly onDragLeave: () => void;
  readonly onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  readonly onTriggerUpload: () => void;
}

export const DropzoneView = ({
  isUploading,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onTriggerUpload,
}: DropzoneViewProps): ReactElement => {
  const dropzoneClasses = [styles.dropzone, isDragOver ? styles.dropzoneActive : '']
    .filter(Boolean)
    .join(' ');

  return (
    <label
      className={dropzoneClasses}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onTriggerUpload}
    >
      <UploadCloud size={36} aria-hidden="true" className={styles.dropzoneIcon} />
      <div>
        <h5 className={styles.dropzoneTitle}>
          {isUploading ? 'Uploading thumbnail...' : 'Upload thumbnail image'}
        </h5>
        <p className={styles.dropzoneHint}>
          Drag and drop an image file here, or click to browse
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={(e) => {
          e.stopPropagation();
          onTriggerUpload();
        }}
      >
        {isUploading ? 'Uploading...' : 'Choose Image File'}
      </Button>
    </label>
  );
};

interface AltSectionProps {
  readonly readOnly: boolean;
  readonly thumbnailAlt: string;
  readonly onAltChange: (alt: string) => void;
}

export const AltSection = ({
  readOnly,
  thumbnailAlt,
  onAltChange,
}: AltSectionProps): ReactElement | null => {
  if (readOnly) {
    if (!thumbnailAlt) return null;
    return (
      <div>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
          }}
        >
          THUMBNAIL ALT TEXT
        </span>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{thumbnailAlt}</p>
      </div>
    );
  }

  return (
    <TextField
      label="Thumbnail Alt Text (Optional)"
      maxChars={300}
      value={thumbnailAlt}
      onChange={(e) => {
        onAltChange(e.target.value);
      }}
      placeholder="Descriptive accessibility text for screen readers and SEO"
    />
  );
};
