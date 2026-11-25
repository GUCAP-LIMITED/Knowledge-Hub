import { useRef, type ReactElement, type ChangeEvent } from 'react';
import { Film } from 'lucide-react';
import { Alert } from '@shared/ui';
import { ACCEPT_ATTRIBUTES } from './file-validation';
import type { VideoPlaylistItem } from './upload-content-types';
import { RequiredMessage, ShakeOnAttempt } from './RequiredHint';
import { useIsFlagged } from './submit-attempt-context';
import { useTutorialVideoPlaylist } from './use-tutorial-video-playlist';
import { TutorialVideoDropzonePane } from './TutorialVideoDropzonePane';
import { TutorialPlaylistSequencePane } from './TutorialPlaylistSequencePane';
import styles from './TutorialVideoPlaylistBuilder.module.css';

export interface TutorialVideoPlaylistBuilderProps {
  readonly playlist: readonly VideoPlaylistItem[];
  readonly onChange: (playlist: readonly VideoPlaylistItem[]) => void;
}

export const TutorialVideoPlaylistBuilder = ({
  playlist,
  onChange,
}: TutorialVideoPlaylistBuilderProps): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const missing = playlist.length === 0;
  const isFlagged = useIsFlagged(missing);

  const {
    uploadError,
    handleAddFiles,
    handleAddExternalUrl,
    handleUpdateTitle,
    handleReorder,
    handleRemove,
  } = useTutorialVideoPlaylist(playlist, onChange);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleAddFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerBrowse = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTES.video}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>
            <Film size={18} className={styles.titleIcon} />
            Tutorial Video Playlist Studio
            <span className={styles.req}> *</span>
          </h3>
          <p className={styles.subtitle}>
            Manage and sequence video parts for your tutorial. Drag and drop video files
            or add external video links.
          </p>
        </div>
      </div>

      {uploadError && (
        <Alert tone="error" title="Upload Failed">
          {uploadError}
        </Alert>
      )}

      <ShakeOnAttempt invalid={missing}>
        <div className={styles.grid}>
          <TutorialVideoDropzonePane
            isInvalid={isFlagged && missing}
            onTriggerBrowse={handleTriggerBrowse}
            onFilesDropped={handleAddFiles}
            onAddExternalUrl={handleAddExternalUrl}
          />

          <TutorialPlaylistSequencePane
            playlist={playlist}
            isInvalid={isFlagged && missing}
            onAddVideoPart={handleTriggerBrowse}
            onUpdateTitle={handleUpdateTitle}
            onReorder={handleReorder}
            onRemove={handleRemove}
          />
        </div>
      </ShakeOnAttempt>

      <RequiredMessage invalid={missing}>
        Tutorial video is required. Please upload at least one video file or add an
        external URL to continue.
      </RequiredMessage>
    </div>
  );
};
