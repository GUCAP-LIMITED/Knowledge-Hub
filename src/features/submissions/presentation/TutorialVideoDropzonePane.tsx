import { useState, type ReactElement, type DragEvent } from 'react';
import { UploadCloud, Plus } from 'lucide-react';
import { Button, TextField } from '@shared/ui';
import { cn, isValidHttpUrl } from '@shared/utils';
import styles from './TutorialVideoPlaylistBuilder.module.css';

interface TutorialExternalUrlFormProps {
  readonly onAddExternalUrl: (url: string, title?: string) => void;
}

const TutorialExternalUrlForm = ({
  onAddExternalUrl,
}: TutorialExternalUrlFormProps): ReactElement => {
  const [externalUrlTitle, setExternalUrlTitle] = useState('');
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [externalUrlError, setExternalUrlError] = useState<string | null>(null);

  const handleSubmit = (): void => {
    const trimmed = externalUrlInput.trim();
    if (!trimmed) return;

    if (!isValidHttpUrl(trimmed)) {
      setExternalUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    if (trimmed.length > 1000) {
      setExternalUrlError('External URL must not exceed 1000 characters.');
      return;
    }

    setExternalUrlError(null);
    const titleVal = externalUrlTitle.trim();
    onAddExternalUrl(trimmed, titleVal.length > 0 ? titleVal : undefined);
    setExternalUrlInput('');
    setExternalUrlTitle('');
  };

  return (
    <div className={styles.urlFormGroup}>
      <TextField
        label="Video Title (Optional)"
        placeholder="e.g. Introduction or Part title"
        value={externalUrlTitle}
        onChange={(e) => {
          setExternalUrlTitle(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className={styles.urlRow}>
        <div className={styles.urlInputWrapper}>
          <TextField
            label="External Video URL"
            placeholder="https://www.youtube.com/... or Vimeo URL"
            value={externalUrlInput}
            error={externalUrlError ?? undefined}
            onChange={(e) => {
              setExternalUrlInput(e.target.value);
              if (externalUrlError) setExternalUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="default"
          size="icon"
          className={styles.addUrlBtn}
          onClick={handleSubmit}
          disabled={!externalUrlInput.trim()}
          aria-label="Add external link"
          title="Add external link"
        >
          <Plus size={18} />
        </Button>
      </div>
    </div>
  );
};

export interface TutorialVideoDropzonePaneProps {
  readonly isInvalid: boolean;
  readonly onTriggerBrowse: () => void;
  readonly onFilesDropped: (files: readonly File[]) => void;
  readonly onAddExternalUrl: (url: string, title?: string) => void;
}

export const TutorialVideoDropzonePane = ({
  isInvalid,
  onTriggerBrowse,
  onFilesDropped,
  onAddExternalUrl,
}: TutorialVideoDropzonePaneProps): ReactElement => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    onFilesDropped(Array.from(files));
  };

  return (
    <div className={cn(styles.leftPane, isInvalid && styles.borderInvalid)}>
      <h4 className={styles.paneTitle}>Upload Video or Add Stream Link</h4>

      <div
        className={cn(styles.dropZone, isDragging && styles.dropZoneActive)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={onTriggerBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTriggerBrowse();
          }
        }}
      >
        <UploadCloud size={32} className={styles.dropIcon} />
        <p className={styles.dropPrimaryText}>
          {isDragging
            ? 'Drop video file(s) here'
            : 'Drop video files here or click to browse'}
        </p>
        <span className={styles.dropHintText}>
          MP4, MOV, WEBM (Multiple files supported)
        </span>
      </div>

      <div className={styles.dividerRow}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>OR ADD VIA URL</span>
        <div className={styles.dividerLine} />
      </div>

      <TutorialExternalUrlForm onAddExternalUrl={onAddExternalUrl} />
    </div>
  );
};
