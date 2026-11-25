/* eslint-disable max-lines-per-function, complexity */
import { useState, useRef, type ReactElement, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, Trash2, CheckCircle2, Film, PlayCircle } from 'lucide-react';
import { BaseLessonFields, type BaseLessonFieldsProps } from './BaseLessonFields';
import { TextField, Button, Spinner, Alert } from '@shared/ui';
import { isValidHttpUrl } from '@shared/utils';
import { MediaViewer } from '@shared/ui/MediaViewer/MediaViewer';
import { PlaybackMediaViewer } from '@features/playback/presentation/PlaybackMediaViewer';
import { useContentModule } from '@features/content/presentation/use-content-module';
import { MEDIA_KIND, MEDIA_SLOT, useGetMediaReadSas } from '@features/content';
import { measureVideoDuration } from '@features/tutorials';
import { ACCEPT_ATTRIBUTES, validateFile } from '../../file-validation';

export const VideoLessonForm = ({
  draft,
  setDraft,
}: BaseLessonFieldsProps): ReactElement => {
  const { id: contentId } = useParams<{ id: string }>();
  const { gateway } = useContentModule();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // If we have a staged azure blob, query the read SAS URL from backend
  const { data: remoteSasUrl } = useGetMediaReadSas(
    contentId ?? '',
    draft.media?.azureBlobName,
  );

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !contentId) return;

    const validation = validateFile(file, 'video');
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Invalid video file format.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create an instant local object URL for previewing before/during upload
    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);
    setIsUploading(true);
    setUploadError(null);

    const resolvedMime = file.type ? file.type : 'video/mp4';

    try {
      const ticket = await gateway.requestUpload(contentId, file.name, resolvedMime);
      await gateway.uploadToBlob(ticket, file);
      const dur = await measureVideoDuration(file);

      setDraft((d) => ({
        ...d,
        durationSeconds:
          typeof d.durationSeconds === 'number' && d.durationSeconds > 0
            ? d.durationSeconds
            : dur,
        media: {
          azureBlobName: ticket.blobName,
          originalFileName: file.name,
          mimeType: resolvedMime,
          sizeBytes: file.size,
          kind: MEDIA_KIND.video,
          slot: MEDIA_SLOT.lesson,
          previewUrl: ticket.readUrl ?? localUrl,
          durationSeconds: dur,
        },
        mediaAssetId: null,
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload video.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = (): void => {
    setLocalPreviewUrl(null);
    setDraft((d) => ({ ...d, media: null, mediaAssetId: null }));
  };

  const hasLiveVideo = Boolean(draft.mediaAssetId);
  const hasStagedVideo = Boolean(draft.media?.azureBlobName);
  const stagedVideoUrl =
    draft.media?.previewUrl ?? remoteSasUrl ?? localPreviewUrl ?? null;

  return (
    <>
      <BaseLessonFields draft={draft} setDraft={setDraft} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginTop: '0.5rem',
          padding: '1.25rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Film size={18} style={{ color: 'var(--color-primary)' }} />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Video Source & Preview
          </h4>
        </div>

        {uploadError && (
          <Alert tone="error" title="Upload Failed">
            {uploadError}
          </Alert>
        )}

        {/* 1. Live published video player */}
        {hasLiveVideo && !hasStagedVideo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayCircle size={16} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Current Video:
              </span>
            </div>
            <PlaybackMediaViewer
              mediaAssetId={draft.mediaAssetId ?? null}
              externalUrl={draft.externalUrl}
              kind="video"
              title={draft.title ?? 'Lesson Video'}
            />
          </div>
        )}

        {/* 2. Staged Shadow Video Player & Details */}
        {hasStagedVideo && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                    {draft.media?.originalFileName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Staged in draft (
                    {((draft.media?.sizeBytes ?? 0) / (1024 * 1024)).toFixed(1)} MB)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveMedia}
                style={{ color: 'var(--color-danger)' }}
              >
                <Trash2 size={15} /> Remove
              </Button>
            </div>

            {/* In-Modal Staged Video Preview Player */}
            {stagedVideoUrl ? (
              <div style={{ marginTop: '0.5rem' }}>
                <span
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Staged Video Preview:
                </span>
                <MediaViewer
                  asset={{
                    kind: 'video',
                    name: draft.media?.originalFileName ?? 'Staged Video',
                    url: stagedVideoUrl,
                  }}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* 3. Upload File Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTRIBUTES.video}
            style={{ display: 'none' }}
            onChange={(e) => {
              void handleFileSelect(e);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Spinner size="sm" label="Uploading..." />
            ) : (
              <>
                <Upload size={14} />
                {hasLiveVideo || hasStagedVideo
                  ? 'Replace Video File'
                  : 'Upload Video File'}
              </>
            )}
          </Button>
          {isUploading && (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Uploading...
            </span>
          )}
        </div>

        {/* 4. External Video URL & Live Preview */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <TextField
            label="Or External Video URL (YouTube, Vimeo, HLS, MP4 direct link)"
            placeholder="https://..."
            value={draft.externalUrl ?? ''}
            maxChars={1000}
            error={
              (draft.externalUrl ?? '').length > 1000
                ? 'External URL must not exceed 1000 characters.'
                : Boolean(draft.externalUrl?.trim()) && !isValidHttpUrl(draft.externalUrl)
                  ? 'Please enter a valid URL starting with http:// or https://'
                  : undefined
            }
            onChange={(e) => {
              const val = e.target.value;
              setDraft((d) => ({ ...d, externalUrl: val }));
            }}
          />

          {!hasLiveVideo &&
            !hasStagedVideo &&
            Boolean(draft.externalUrl?.trim()) &&
            isValidHttpUrl(draft.externalUrl) && (
              <div style={{ marginTop: '0.5rem' }}>
                <span
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Live External Video Preview:
                </span>
                <MediaViewer
                  asset={{
                    kind: 'video',
                    name: draft.title ?? 'External Video',
                    url: draft.externalUrl ?? '',
                  }}
                />
              </div>
            )}
        </div>
      </div>
    </>
  );
};
