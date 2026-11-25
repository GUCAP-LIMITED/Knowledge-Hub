/* eslint-disable max-lines-per-function, complexity */
import { useState, useRef, type ReactElement, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, Trash2, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { BaseLessonFields, type BaseLessonFieldsProps } from './BaseLessonFields';
import { TextField, Button, Spinner, Alert } from '@shared/ui';
import { isValidHttpUrl } from '@shared/utils';
import { MediaViewer } from '@shared/ui/MediaViewer/MediaViewer';
import { PlaybackMediaViewer } from '@features/playback/presentation/PlaybackMediaViewer';
import { useContentModule } from '@features/content/presentation/use-content-module';
import { MEDIA_KIND, MEDIA_SLOT, useGetMediaReadSas } from '@features/content';
import { ACCEPT_ATTRIBUTES, validateFile } from '../../file-validation';
import {
  resolveDocumentMediaKind,
  resolveDocumentMimeType,
} from './document-lesson-utils';

export const DocumentLessonForm = ({
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

    const validation = validateFile(file, 'document');
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Invalid document file format.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);
    setIsUploading(true);
    setUploadError(null);

    try {
      const mimeType = resolveDocumentMimeType(file.name, file.type);
      const ticket = await gateway.requestUpload(contentId, file.name, mimeType);
      await gateway.uploadToBlob(ticket, file);

      setDraft((d) => ({
        ...d,
        media: {
          azureBlobName: ticket.blobName,
          originalFileName: file.name,
          mimeType,
          sizeBytes: file.size,
          kind: MEDIA_KIND.document,
          slot: MEDIA_SLOT.lesson,
          previewUrl: ticket.readUrl ?? localUrl,
        },
        mediaAssetId: null,
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload document.');
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

  const hasStagedDoc = Boolean(draft.media?.azureBlobName);
  const hasLiveDoc = Boolean(draft.mediaAssetId);
  const stagedDocUrl = draft.media?.previewUrl ?? remoteSasUrl ?? localPreviewUrl ?? null;

  return (
    <>
      <BaseLessonFields draft={draft} setDraft={setDraft} showDuration={false} />

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
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Document Source & Preview
          </h4>
        </div>

        {uploadError && (
          <Alert tone="error" title="Upload Failed">
            {uploadError}
          </Alert>
        )}

        {/* 1. Live published document preview */}
        {hasLiveDoc && !hasStagedDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Current Live Document:
            </span>
            <PlaybackMediaViewer
              mediaAssetId={draft.mediaAssetId ?? null}
              externalUrl={draft.externalUrl}
              kind={resolveDocumentMediaKind(draft.externalUrl ?? draft.title)}
              title={draft.title ?? 'Lesson Document'}
            />
          </div>
        )}

        {/* 2. Staged Document Card & In-Modal Preview */}
        {hasStagedDoc && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {stagedDocUrl && (
                  <a
                    href={stagedDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.85rem',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      marginRight: '0.5rem',
                    }}
                  >
                    <ExternalLink size={14} /> Open in new tab
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveMedia}
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={15} /> Remove
                </Button>
              </div>
            </div>

            {/* In-Modal Document Viewer */}
            {stagedDocUrl ? (
              <div style={{ marginTop: '0.5rem' }}>
                <MediaViewer
                  asset={{
                    kind: resolveDocumentMediaKind(
                      draft.media?.originalFileName ?? stagedDocUrl,
                    ),
                    name: draft.media?.originalFileName ?? 'Staged Document',
                    url: stagedDocUrl,
                  }}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* 3. Upload Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTRIBUTES.document}
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
                {hasLiveDoc || hasStagedDoc
                  ? 'Replace Document'
                  : 'Upload Document (PDF / Office)'}
              </>
            )}
          </Button>
          {isUploading && (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Uploading...
            </span>
          )}
        </div>

        {/* 4. External Document URL */}
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
            label="Or External Document URL (PDF Link / Slides Link)"
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

          {!hasLiveDoc &&
            !hasStagedDoc &&
            Boolean(draft.externalUrl?.trim()) &&
            isValidHttpUrl(draft.externalUrl) && (
              <div style={{ marginTop: '0.5rem' }}>
                <MediaViewer
                  asset={{
                    kind: resolveDocumentMediaKind(draft.externalUrl),
                    name: draft.title ?? 'External Document',
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
