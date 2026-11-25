/* eslint-disable max-lines-per-function */
import type { ReactElement } from 'react';
import { Alert } from '@shared/ui';
import type { MediaDraftInput } from '@features/content';
import { ACCEPT_ATTRIBUTES } from './file-validation';
import { useThumbnailUpload } from './use-thumbnail-upload';
import {
  ThumbnailHeader,
  PreviewView,
  DropzoneView,
  AltSection,
} from './ThumbnailUploadViews';
import styles from './ThumbnailUploadField.module.css';

export interface ThumbnailUploadFieldProps {
  readonly contentId: string;
  readonly liveThumbnailUrl?: string | null | undefined;
  readonly draftMedia?: readonly MediaDraftInput[] | undefined;
  readonly thumbnailAlt: string;
  readonly onAltChange: (alt: string) => void;
  readonly onMediaUpdate: (media: readonly MediaDraftInput[]) => void;
  readonly onThumbnailAssetIdChange?: ((id: string | null) => void) | undefined;
  readonly readOnly?: boolean | undefined;
  readonly error?: string | null | undefined;
}

export const ThumbnailUploadField = ({
  contentId,
  liveThumbnailUrl = null,
  draftMedia = [],
  thumbnailAlt,
  onAltChange,
  onMediaUpdate,
  onThumbnailAssetIdChange,
  readOnly = false,
  error = null,
}: ThumbnailUploadFieldProps): ReactElement => {
  const {
    fileInputRef,
    isUploading,
    uploadError,
    isDragOver,
    setIsDragOver,
    activeThumbnailUrl,
    isSasLoading,
    isStagedBlob,
    hasLiveMedia,
    draftThumbnail,
    handleFileChange,
    handleDragOver,
    handleDrop,
    triggerFileInput,
  } = useThumbnailUpload({
    contentId,
    liveThumbnailUrl,
    draftMedia,
    onMediaUpdate,
    onThumbnailAssetIdChange,
    readOnly,
  });

  const displayError = uploadError ?? error;

  return (
    <div className={styles.container}>
      <ThumbnailHeader />

      {displayError ? (
        <Alert tone="error" title="Thumbnail Error">
          {displayError}
        </Alert>
      ) : null}

      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTES.image}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {activeThumbnailUrl ? (
        <PreviewView
          activeThumbnailUrl={activeThumbnailUrl}
          thumbnailAlt={thumbnailAlt}
          isSasLoading={isSasLoading}
          isStagedBlob={isStagedBlob}
          hasLiveMedia={hasLiveMedia}
          draftFileName={draftThumbnail?.originalFileName}
          readOnly={readOnly}
          isUploading={isUploading}
          onTriggerUpload={triggerFileInput}
        />
      ) : !readOnly ? (
        <DropzoneView
          isUploading={isUploading}
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={() => {
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
          onTriggerUpload={triggerFileInput}
        />
      ) : (
        <div style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
          No thumbnail attached.
        </div>
      )}

      <AltSection
        readOnly={readOnly}
        thumbnailAlt={thumbnailAlt}
        onAltChange={onAltChange}
      />
    </div>
  );
};
