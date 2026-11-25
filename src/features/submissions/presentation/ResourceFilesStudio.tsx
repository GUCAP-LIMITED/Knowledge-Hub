/* eslint-disable max-lines, max-lines-per-function, complexity */
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type ReactElement,
  type ChangeEvent,
} from 'react';
import {
  FolderOpen,
  UploadCloud,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Star,
} from 'lucide-react';
import { Alert, Button, Spinner, Modal } from '@shared/ui';
import {
  MEDIA_KIND,
  MEDIA_SLOT,
  type MediaDraftInput,
  useGetMediaReadSas,
} from '@features/content';
import { useContentModule } from '@features/content/presentation/use-content-module';
import { Resource } from '@features/resources/domain';
import { ResourceViewer } from '@features/resources/presentation/ResourceViewer';
import { ACCEPT_ATTRIBUTES, validateFileList } from './file-validation';
import { ResourceFileTypeIcon, ResourceFormatBadge } from './ResourceFileTypeIcon';
import { formatFileSize } from './resource-file-types';
import { useDraftEditor } from './use-draft-editor';

export interface ResourceFilesStudioProps {
  readonly readOnly?: boolean;
}

const StagedFileViewerModal = ({
  file,
  contentId,
  onClose,
}: {
  readonly file: MediaDraftInput | null;
  readonly contentId: string;
  readonly onClose: () => void;
}): ReactElement => {
  const isStaged = Boolean(file?.azureBlobName);
  const { data: sasUrl, isLoading: isSasLoading } = useGetMediaReadSas(
    contentId,
    file?.azureBlobName,
  );

  const targetMediaUrl = isStaged
    ? (sasUrl ?? file?.previewUrl ?? null)
    : (file?.previewUrl ?? file?.id ?? null);

  const isPreparing = isStaged && isSasLoading;
  const isAvailable = Boolean(targetMediaUrl);

  return (
    <Modal
      open={file !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={file?.originalFileName ?? 'Document Preview'}
      description={
        isStaged ? 'Staged Resource Preview (Draft)' : 'Published Resource Preview'
      }
      size="xl"
    >
      {isPreparing ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <Spinner label="Loading document preview..." />
        </div>
      ) : isAvailable && targetMediaUrl ? (
        <div style={{ height: '70vh', minHeight: '500px' }}>
          <ResourceViewer
            resource={
              new Resource({
                id: file?.id ?? 'preview-doc',
                title: file?.originalFileName ?? 'Document',
                category: 'Resource',
                type: file?.originalFileName
                  ? (file.originalFileName.split('.').pop()?.toUpperCase() ?? 'DOC')
                  : 'DOC',
                views: 0,
                helpful: 0,
                updated: new Date(),
                description: '',
                visibility: 'Team',
                mediaUrl: targetMediaUrl,
              })
            }
          />
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Alert tone="warning" title="Preview Unavailable">
            Could not generate a live preview URL for this document.
          </Alert>
        </div>
      )}
    </Modal>
  );
};

const getResourceDisplayTitle = (item: MediaDraftInput): string => {
  const trimmed = item.title?.trim();
  if (trimmed && trimmed.length > 0) {
    return trimmed;
  }
  return item.originalFileName.trim().length > 0
    ? item.originalFileName
    : 'Resource Document';
};

export const ResourceFilesStudio = ({
  readOnly = false,
}: ResourceFilesStudioProps): ReactElement => {
  const { contentId, draftState, updateMedia } = useDraftEditor();
  const { gateway } = useContentModule();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewingFile, setPreviewingFile] = useState<MediaDraftInput | null>(null);

  const thumbnailMedia = useMemo(
    () => (draftState.media ?? []).filter((m) => m.slot === MEDIA_SLOT.thumbnail),
    [draftState.media],
  );
  const mediaList = useMemo(
    () => (draftState.media ?? []).filter((m) => m.slot !== MEDIA_SLOT.thumbnail),
    [draftState.media],
  );

  // Gracefully resolve file size via HEAD request if an existing item has sizeBytes === 0
  useEffect(() => {
    const zeroSizeItems = mediaList.filter(
      (m) => (!m.sizeBytes || m.sizeBytes <= 0) && Boolean(m.previewUrl),
    );
    if (zeroSizeItems.length === 0) return;

    let isMounted = true;
    const fetchSizes = async (): Promise<void> => {
      const nextMedia = await Promise.all(
        mediaList.map(async (item) => {
          if ((item.sizeBytes && item.sizeBytes > 0) || !item.previewUrl) {
            return item;
          }
          try {
            const resp = await fetch(item.previewUrl, { method: 'HEAD' });
            const cl = resp.headers.get('content-length');
            if (cl) {
              const parsed = parseInt(cl, 10);
              if (parsed > 0) {
                return { ...item, sizeBytes: parsed };
              }
            }
          } catch {
            // Ignore network or CORS errors on HEAD fallback
          }
          return item;
        }),
      );

      const hasChanges = nextMedia.some(
        (item, idx) => item.sizeBytes !== mediaList[idx]?.sizeBytes,
      );
      if (isMounted && hasChanges) {
        updateMedia([...thumbnailMedia, ...nextMedia]);
      }
    };

    void fetchSizes();

    return () => {
      isMounted = false;
    };
  }, [mediaList, thumbnailMedia, updateMedia]);

  const handleFilesSelect = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !contentId) return;

    const validation = validateFileList(files, 'resource');
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Invalid resource file format.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const newlyStaged: MediaDraftInput[] = [];

    try {
      for (const file of files) {
        const localUrl = URL.createObjectURL(file);
        const resolvedMime = file.type || 'application/octet-stream';
        const isFirst = mediaList.length === 0 && newlyStaged.length === 0;

        const ticket = await gateway.requestUpload(contentId, file.name, resolvedMime);
        await gateway.uploadToBlob(ticket, file);

        newlyStaged.push({
          azureBlobName: ticket.blobName,
          originalFileName: file.name,
          mimeType: resolvedMime,
          sizeBytes: file.size,
          kind: MEDIA_KIND.document,
          slot: isFirst ? MEDIA_SLOT.resourceFile : MEDIA_SLOT.attachment,
          previewUrl: ticket.readUrl ?? localUrl,
        });
      }

      updateMedia([...thumbnailMedia, ...mediaList, ...newlyStaged]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload resource file(s).',
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (item: MediaDraftInput): void => {
    const remaining = mediaList.filter(
      (m) =>
        (m.azureBlobName && m.azureBlobName !== item.azureBlobName) ||
        (m.id && m.id !== item.id),
    );
    updateMedia([...thumbnailMedia, ...remaining]);
  };

  const handleSetPrimary = (targetIndex: number): void => {
    const updated = mediaList.map((m, idx) => ({
      ...m,
      slot: idx === targetIndex ? MEDIA_SLOT.resourceFile : MEDIA_SLOT.attachment,
    }));
    const primary = updated[targetIndex];
    if (primary) {
      const rest = updated.filter((_, idx) => idx !== targetIndex);
      updateMedia([...thumbnailMedia, primary, ...rest]);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          {readOnly ? 'Resource Files Inspection' : 'Resource Files & Attachments'}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {readOnly
            ? 'Review the reference documents, spreadsheets, and files submitted for this resource.'
            : 'Manage downloadable materials (PDFs, slides, spreadsheets, templates). The primary file is shown as the main download.'}
        </p>
      </div>

      {uploadError && (
        <Alert tone="error" title="Upload Failed">
          {uploadError}
        </Alert>
      )}

      {/* Files List Card */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--color-surface)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderOpen size={20} style={{ color: 'var(--color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Attached Documents ({String(mediaList.length)})
            </h4>
          </div>

          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              <UploadCloud size={14} style={{ marginRight: '0.35rem' }} />
              {isUploading ? 'Uploading...' : 'Add Files'}
            </Button>
          )}
        </div>

        {mediaList.length === 0 ? (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sunken)',
            }}
          >
            <FolderOpen
              size={40}
              style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}
            />
            <h5 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>
              No files attached to this resource yet
            </h5>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}
            >
              {readOnly
                ? 'No files were attached by the author.'
                : 'Upload PDF documents, Word files, Excel spreadsheets, or presentation decks.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mediaList.map((item, index) => {
              const isPrimary = index === 0 || item.slot === MEDIA_SLOT.resourceFile;
              const isStaged = Boolean(item.azureBlobName);

              return (
                <div
                  key={
                    item.azureBlobName ? item.azureBlobName : (item.id ?? String(index))
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      overflow: 'hidden',
                    }}
                  >
                    <ResourceFileTypeIcon
                      fileName={item.originalFileName}
                      mimeType={item.mimeType}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: 'var(--color-text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {getResourceDisplayTitle(item)}
                        </span>
                        <ResourceFormatBadge
                          fileName={item.originalFileName}
                          mimeType={item.mimeType}
                        />
                        {isPrimary && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--color-primary)',
                              backgroundColor: 'var(--color-primary-subtle)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '0.15rem',
                        }}
                      >
                        <span>{formatFileSize(item.sizeBytes)}</span>
                        <span>•</span>
                        {isStaged ? (
                          <span
                            style={{
                              color: 'var(--color-warning)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Clock size={11} /> Staged
                          </span>
                        ) : (
                          <span
                            style={{
                              color: 'var(--color-success)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <CheckCircle2 size={11} /> Published
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewingFile(item);
                      }}
                      title="Preview Document"
                    >
                      <Eye size={14} style={{ marginRight: '0.25rem' }} /> Preview
                    </Button>

                    {!readOnly && !isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleSetPrimary(index);
                        }}
                        title="Make Primary Download"
                      >
                        <Star size={14} style={{ marginRight: '0.25rem' }} /> Make Primary
                      </Button>
                    )}

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleRemove(item);
                        }}
                        style={{ color: 'var(--color-danger)' }}
                        title="Remove File"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden Multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTES.resource}
          style={{ display: 'none' }}
          onChange={(e) => {
            void handleFilesSelect(e);
          }}
        />
      </div>

      {/* Staged File Preview Modal */}
      <StagedFileViewerModal
        file={previewingFile}
        contentId={contentId}
        onClose={() => {
          setPreviewingFile(null);
        }}
      />
    </div>
  );
};
