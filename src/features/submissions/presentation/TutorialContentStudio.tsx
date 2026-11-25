/* eslint-disable max-lines, max-lines-per-function, complexity */
import { useState, useRef, type ReactElement, type ChangeEvent } from 'react';
import {
  Film,
  UploadCloud,
  Trash2,
  PlayCircle,
  CheckCircle2,
  Clock,
  ChevronUp,
  ChevronDown,
  Plus,
  ExternalLink,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { Alert, Button, Spinner, TextField, DurationInput, Badge } from '@shared/ui';
import { isValidDurationFormat, isValidHttpUrl, parseDuration } from '@shared/utils';
import { PlaybackMediaViewer } from '@features/playback';
import {
  MEDIA_KIND,
  MEDIA_SLOT,
  useGetMediaReadSas,
  type MediaDraftInput,
} from '@features/content';
import { useContentModule } from '@features/content/presentation/use-content-module';
import {
  formatPlaylistDuration,
  computePlaylistTotalDuration,
  measureVideoDuration,
  savePlaylistOrder,
  ExternalVideoHint,
} from '@features/tutorials';
import { ACCEPT_ATTRIBUTES, validateFile } from './file-validation';
import { moveInArray } from './upload-content-types';
import { useDraftEditor } from './use-draft-editor';

export interface TutorialContentStudioProps {
  readonly readOnly?: boolean;
}

const formatSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getDomain = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'External Source';
  }
};

export const TutorialContentStudio = ({
  readOnly = false,
}: TutorialContentStudioProps): ReactElement => {
  const { contentId, draftState, updateMedia, updateDetails } = useDraftEditor();
  const { gateway } = useContentModule();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [externalUrlError, setExternalUrlError] = useState<string | null>(null);
  const [editingDurationIndex, setEditingDurationIndex] = useState<number | null>(null);
  const [editingDurationDraft, setEditingDurationDraft] = useState('');
  const [editingDurationError, setEditingDurationError] = useState(false);
  const [externalUrlTitle, setExternalUrlTitle] = useState('');
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [editingTitleDraft, setEditingTitleDraft] = useState('');

  const syncOrder = (videos: readonly MediaDraftInput[]): void => {
    const ids = videos.map((v) => v.id).filter((id): id is string => Boolean(id));
    if (contentId && ids.length > 0) {
      savePlaylistOrder(contentId, ids);
    }
  };

  // Preserve non-video assets (like thumbnail)
  const thumbnailMedia =
    draftState.media?.filter((m) => m.slot === MEDIA_SLOT.thumbnail) ?? [];

  // Playlist video assets sorted by displayOrder
  const videoMedia = (
    draftState.media?.filter((m) => m.slot !== MEDIA_SLOT.thumbnail) ?? []
  )
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const safeIndex =
    selectedIndex >= videoMedia.length
      ? Math.max(0, videoMedia.length - 1)
      : selectedIndex;
  const activeVideo: MediaDraftInput | null = videoMedia[safeIndex] ?? null;

  const getVideoDisplayTitle = (video: MediaDraftInput): string => {
    return video.title && video.title.trim().length > 0
      ? video.title.trim()
      : video.originalFileName;
  };

  const isStagedBlob = Boolean(activeVideo?.azureBlobName);
  const hasLiveMedia = Boolean(activeVideo?.id && !activeVideo.azureBlobName);

  // Query SAS URL if active video is a staged blob
  const { data: remoteSasUrl, isLoading: isSasLoading } = useGetMediaReadSas(
    contentId,
    activeVideo?.azureBlobName,
  );

  const activePlaybackUrl =
    activeVideo?.externalUrl ?? activeVideo?.previewUrl ?? remoteSasUrl ?? null;

  const handleFilesSelect = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !contentId) return;

    const filesToAdd = Array.from(fileList);
    for (const file of filesToAdd) {
      const validation = validateFile(file, 'tutorialPrimary');
      if (!validation.valid) {
        setUploadError(validation.error ?? 'Invalid tutorial media file format.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newMediaItems: MediaDraftInput[] = [];
      let currentOrder = videoMedia.length;
      let totalAddedDurationSeconds = 0;

      for (const file of filesToAdd) {
        const kind = MEDIA_KIND.video;
        const resolvedMime = file.type || 'video/mp4';
        const localUrl = URL.createObjectURL(file);
        const ticket = await gateway.requestUpload(contentId, file.name, resolvedMime);
        await gateway.uploadToBlob(ticket, file);

        const dur = await measureVideoDuration(file);
        totalAddedDurationSeconds += dur;

        newMediaItems.push({
          azureBlobName: ticket.blobName,
          originalFileName: file.name,
          mimeType: resolvedMime,
          sizeBytes: file.size,
          kind,
          slot: MEDIA_SLOT.primary,
          displayOrder: currentOrder++,
          previewUrl: ticket.readUrl ?? localUrl,
          durationSeconds: dur,
        });
      }

      const updatedVideos = [...videoMedia, ...newMediaItems].map((v, i) => ({
        ...v,
        displayOrder: i,
      }));

      syncOrder(updatedVideos);
      updateMedia([...thumbnailMedia, ...updatedVideos]);

      if (totalAddedDurationSeconds > 0) {
        const currentSeconds = draftState.details.durationSeconds;
        updateDetails({ durationSeconds: currentSeconds + totalAddedDurationSeconds });
      }

      setSelectedIndex(updatedVideos.length - newMediaItems.length);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload tutorial video.',
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReorder = (fromIndex: number, delta: number): void => {
    const reordered = moveInArray(videoMedia, fromIndex, delta);
    const updatedVideos = reordered.map((v, i) => ({ ...v, displayOrder: i }));
    syncOrder(updatedVideos);
    updateMedia([...thumbnailMedia, ...updatedVideos]);
    setSelectedIndex(fromIndex + delta);
  };

  const handleCancelEditDuration = (): void => {
    setEditingDurationIndex(null);
    setEditingDurationDraft('');
    setEditingDurationError(false);
  };

  const handleStartEditDuration = (index: number, currentSeconds?: number): void => {
    setEditingDurationIndex(index);
    if (typeof currentSeconds === 'number' && currentSeconds > 0) {
      setEditingDurationDraft(formatPlaylistDuration(currentSeconds));
    } else {
      setEditingDurationDraft('');
    }
    setEditingDurationError(false);
  };

  const handleSaveEditDuration = (index: number): boolean => {
    const trimmed = editingDurationDraft.trim();
    let parsedSeconds = 0;
    if (trimmed !== '' && trimmed !== '--:--' && trimmed !== '--') {
      if (!isValidDurationFormat(trimmed)) {
        setEditingDurationError(true);
        return false;
      }
      parsedSeconds = parseDuration(trimmed);
    }

    const updatedVideos = videoMedia.map((v, i) =>
      i === index ? { ...v, durationSeconds: parsedSeconds } : v,
    );
    updateMedia([...thumbnailMedia, ...updatedVideos]);

    const newTotal = computePlaylistTotalDuration(updatedVideos);
    updateDetails({ durationSeconds: newTotal });

    setEditingDurationIndex(null);
    setEditingDurationDraft('');
    setEditingDurationError(false);
    return true;
  };

  const handleRemoveVideo = (index: number): void => {
    const updatedVideos = videoMedia
      .filter((_, i) => i !== index)
      .map((v, i) => ({ ...v, displayOrder: i }));
    syncOrder(updatedVideos);
    updateMedia([...thumbnailMedia, ...updatedVideos]);
    if (selectedIndex >= updatedVideos.length) {
      setSelectedIndex(Math.max(0, updatedVideos.length - 1));
    }
    if (editingDurationIndex === index) {
      handleCancelEditDuration();
    } else if (editingDurationIndex !== null && editingDurationIndex > index) {
      setEditingDurationIndex(editingDurationIndex - 1);
    }
    if (editingTitleIndex === index) {
      setEditingTitleIndex(null);
      setEditingTitleDraft('');
    } else if (editingTitleIndex !== null && editingTitleIndex > index) {
      setEditingTitleIndex(editingTitleIndex - 1);
    }
    const newTotal = computePlaylistTotalDuration(updatedVideos);
    updateDetails({ durationSeconds: newTotal });
  };

  const handleCancelEditTitle = (): void => {
    setEditingTitleIndex(null);
    setEditingTitleDraft('');
  };

  const handleStartEditTitle = (index: number, currentTitle: string): void => {
    setEditingTitleIndex(index);
    setEditingTitleDraft(currentTitle);
  };

  const handleSaveEditTitle = (index: number): void => {
    const trimmed = editingTitleDraft.trim();
    if (trimmed) {
      const updatedVideos = videoMedia.map((v, i) =>
        i === index ? { ...v, title: trimmed || null } : v,
      );
      updateMedia([...thumbnailMedia, ...updatedVideos]);
    }
    setEditingTitleIndex(null);
    setEditingTitleDraft('');
  };

  const handleAddExternalUrl = (): void => {
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
    const resolvedTitle =
      externalUrlTitle.trim() || `External Video Part ${String(videoMedia.length + 1)}`;
    const newPart: MediaDraftInput = {
      azureBlobName: '',
      originalFileName: resolvedTitle,
      title: resolvedTitle,
      mimeType: null,
      sizeBytes: 0,
      kind: MEDIA_KIND.video,
      slot: MEDIA_SLOT.primary,
      displayOrder: videoMedia.length,
      externalUrl: trimmed,
      previewUrl: trimmed,
    };

    const updatedVideos = [...videoMedia, newPart].map((v, i) => ({
      ...v,
      displayOrder: i,
    }));
    syncOrder(updatedVideos);
    updateMedia([...thumbnailMedia, ...updatedVideos]);
    setExternalUrlInput('');
    setExternalUrlTitle('');
    setSelectedIndex(updatedVideos.length - 1);
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
          {readOnly ? 'Tutorial Video Playlist' : 'Tutorial Video Playlist Studio'}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {readOnly
            ? 'Review the sequence of tutorial video parts submitted by the author.'
            : 'Manage and sequence multiple video parts for your tutorial. Drag or use controls to reorder playback.'}
        </p>
      </div>

      {uploadError && (
        <Alert tone="error" title="Upload Failed">
          {uploadError}
        </Alert>
      )}

      {/* Main Studio Grid: Left Pane (Player) & Right Pane (Playlist) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Pane: Active Video Player Preview */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--color-surface)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
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
              <Film size={20} style={{ color: 'var(--color-primary)' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                {activeVideo ? getVideoDisplayTitle(activeVideo) : 'Player Preview'}
              </h4>
            </div>

            {isStagedBlob && (
              <Badge tone="warning" size="sm">
                <Clock size={12} style={{ marginRight: '0.25rem' }} /> Staged in Draft
              </Badge>
            )}

            {hasLiveMedia && (
              <Badge tone="success" size="sm">
                <CheckCircle2 size={12} style={{ marginRight: '0.25rem' }} /> Live Media
              </Badge>
            )}

            {activeVideo?.externalUrl && (
              <Badge tone="neutral" size="sm">
                <ExternalLink size={12} style={{ marginRight: '0.25rem' }} /> External
                Link
              </Badge>
            )}
          </div>

          {activeVideo ? (
            isStagedBlob && isSasLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <Spinner label="Loading video stream..." />
              </div>
            ) : isStagedBlob ? (
              <PlaybackMediaViewer
                mediaAssetId={null}
                externalUrl={activePlaybackUrl}
                kind="video"
                title={getVideoDisplayTitle(activeVideo)}
              />
            ) : activeVideo.externalUrl ? (
              <ExternalVideoHint
                url={activeVideo.externalUrl}
                title={getVideoDisplayTitle(activeVideo)}
              />
            ) : hasLiveMedia ? (
              <PlaybackMediaViewer
                mediaAssetId={activeVideo.id ?? null}
                externalUrl={null}
                kind="video"
                title={getVideoDisplayTitle(activeVideo)}
              />
            ) : null
          ) : (
            <div
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-sunken)',
              }}
            >
              <PlayCircle
                size={44}
                style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}
              />
              <h5 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>
                No videos in playlist
              </h5>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {readOnly
                  ? 'The author has not attached any videos to this tutorial.'
                  : 'Upload one or more video parts to build your playlist.'}
              </p>
            </div>
          )}

          {activeVideo && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <span>Source: {activeVideo.originalFileName}</span>
              <span>{formatSize(activeVideo.sizeBytes)}</span>
            </div>
          )}
        </div>

        {/* Right Pane: Playlist Items List & Ordering Controls */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--color-surface)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Playlist Sequence ({videoMedia.length}{' '}
              {videoMedia.length === 1 ? 'part' : 'parts'})
            </h4>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Video Part
              </Button>
            )}
          </div>

          {videoMedia.length === 0 ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                margin: '1rem 0',
              }}
            >
              No videos added yet. Click &quot;Add Video Part&quot; to begin.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {videoMedia.map((vid, idx) => {
                const isSelected = idx === safeIndex;
                const isItemStaged = Boolean(vid.azureBlobName);
                return (
                  <div
                    key={vid.id ?? `${vid.azureBlobName}-${String(idx)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '1px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isSelected
                        ? 'var(--color-primary-subtle, rgba(59, 130, 246, 0.08))'
                        : 'var(--color-surface)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        minWidth: 0,
                        flex: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedIndex(idx);
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-sunken)',
                          color: isSelected ? '#ffffff' : 'var(--color-text-subtle)',
                          flexShrink: 0,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div
                        style={{
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {editingTitleIndex === idx ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              marginBottom: '0.2rem',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <input
                              type="text"
                              value={editingTitleDraft}
                              onChange={(e) => {
                                setEditingTitleDraft(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditTitle(idx);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEditTitle();
                                }
                              }}
                              onBlur={(e) => {
                                const related = e.relatedTarget as HTMLElement | null;
                                if (related?.closest('[data-title-action]')) {
                                  return;
                                }
                                handleSaveEditTitle(idx);
                              }}
                              placeholder="Enter title..."
                              aria-label={`Title for part ${String(idx + 1)}`}
                              style={{
                                padding: '0.15rem 0.4rem',
                                fontSize: '0.8rem',
                                borderRadius: 'var(--radius-sm, 4px)',
                                border: '1px solid var(--color-primary)',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                width: '150px',
                                outline: 'none',
                              }}
                              autoFocus
                            />
                            <Button
                              type="button"
                              data-title-action="save"
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                handleSaveEditTitle(idx);
                              }}
                              aria-label={`Save title for part ${String(idx + 1)}`}
                              style={{
                                color: 'var(--color-success, #10b981)',
                                padding: '0.15rem',
                              }}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              type="button"
                              data-title-action="cancel"
                              variant="ghost"
                              size="xs"
                              onClick={handleCancelEditTitle}
                              aria-label={`Cancel editing title for part ${String(idx + 1)}`}
                              style={{
                                color: 'var(--color-text-muted)',
                                padding: '0.15rem',
                              }}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: isSelected ? 600 : 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getVideoDisplayTitle(vid)}
                          </span>
                        )}
                        {editingDurationIndex === idx ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              marginTop: '0.25rem',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              Duration:
                            </span>
                            <input
                              type="text"
                              value={editingDurationDraft}
                              onChange={(e) => {
                                setEditingDurationDraft(e.target.value);
                                if (editingDurationError) setEditingDurationError(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditDuration(idx);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEditDuration();
                                }
                              }}
                              onBlur={(e) => {
                                const related = e.relatedTarget as HTMLElement | null;
                                if (related?.closest('[data-duration-action]')) {
                                  return;
                                }
                                const trimmed = editingDurationDraft.trim();
                                if (
                                  trimmed === '' ||
                                  trimmed === '--:--' ||
                                  isValidDurationFormat(trimmed)
                                ) {
                                  handleSaveEditDuration(idx);
                                }
                              }}
                              placeholder="00:00:00"
                              aria-label={`Duration for part ${String(idx + 1)}`}
                              style={{
                                padding: '0.15rem 0.4rem',
                                fontSize: '0.75rem',
                                borderRadius: 'var(--radius-sm, 4px)',
                                border: editingDurationError
                                  ? '1px solid var(--color-danger, #ef4444)'
                                  : '1px solid var(--color-border, #d1d5db)',
                                backgroundColor: 'var(--color-surface, #ffffff)',
                                color: 'var(--color-text, #111827)',
                                width: '85px',
                                outline: 'none',
                              }}
                              autoFocus
                            />
                            <Button
                              type="button"
                              data-duration-action="save"
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                handleSaveEditDuration(idx);
                              }}
                              aria-label={`Save duration for part ${String(idx + 1)}`}
                              style={{
                                color: 'var(--color-success, #10b981)',
                                padding: '0.15rem',
                              }}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              type="button"
                              data-duration-action="cancel"
                              variant="ghost"
                              size="xs"
                              onClick={handleCancelEditDuration}
                              aria-label={`Cancel editing duration for part ${String(idx + 1)}`}
                              style={{
                                color: 'var(--color-text-muted)',
                                padding: '0.15rem',
                              }}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : vid.externalUrl ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.75rem',
                              marginTop: '0.15rem',
                            }}
                          >
                            <span style={{ color: 'var(--color-text-muted)' }}>
                              {getDomain(vid.externalUrl)}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                            <a
                              href={vid.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                color: 'var(--color-primary)',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <ExternalLink size={12} />
                              Open
                            </a>
                            {vid.durationSeconds && vid.durationSeconds > 0 ? (
                              <>
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                  ·
                                </span>
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                  {formatPlaylistDuration(vid.durationSeconds)}
                                </span>
                              </>
                            ) : null}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {isItemStaged ? 'Staged' : 'Published'} ·{' '}
                            {formatSize(vid.sizeBytes)} ·{' '}
                            {formatPlaylistDuration(vid.durationSeconds)}
                          </span>
                        )}
                      </div>
                    </div>

                    {!readOnly && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          marginLeft: '0.5rem',
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={idx === 0}
                          onClick={() => {
                            handleReorder(idx, -1);
                          }}
                          aria-label={`Move part ${String(idx + 1)} up`}
                        >
                          <ChevronUp size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={idx === videoMedia.length - 1}
                          onClick={() => {
                            handleReorder(idx, 1);
                          }}
                          aria-label={`Move part ${String(idx + 1)} down`}
                        >
                          <ChevronDown size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            if (editingTitleIndex === idx) {
                              handleCancelEditTitle();
                            } else {
                              handleStartEditTitle(idx, getVideoDisplayTitle(vid));
                            }
                          }}
                          aria-label={`Edit title for part ${String(idx + 1)}`}
                          title="Edit title"
                          style={
                            editingTitleIndex === idx
                              ? { color: 'var(--color-primary)' }
                              : undefined
                          }
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            if (editingDurationIndex === idx) {
                              handleCancelEditDuration();
                            } else {
                              handleStartEditDuration(idx, vid.durationSeconds);
                            }
                          }}
                          aria-label={`Edit duration for part ${String(idx + 1)}`}
                          title="Edit duration"
                          style={
                            editingDurationIndex === idx
                              ? { color: 'var(--color-primary)' }
                              : undefined
                          }
                        >
                          <Clock size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            handleRemoveVideo(idx);
                          }}
                          aria-label={`Remove part ${String(idx + 1)}`}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add & Metadata Section (Edit Mode Only) */}
          {!readOnly && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_ATTRIBUTES.tutorialPrimary}
                style={{ display: 'none' }}
                onChange={(e) => {
                  void handleFilesSelect(e);
                }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                  style={{ flex: 1 }}
                >
                  <UploadCloud size={16} style={{ marginRight: '0.5rem' }} />
                  {isUploading ? 'Uploading Video Part(s)...' : 'Upload Video File(s)'}
                </Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  OR ADD VIA URL
                </span>
                <div
                  style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                      handleAddExternalUrl();
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
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
                          handleAddExternalUrl();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={handleAddExternalUrl}
                    disabled={!externalUrlInput.trim()}
                    aria-label="Add external link"
                    title="Add external link"
                    style={{
                      flexShrink: 0,
                      marginTop: '1.65rem',
                      height: '38px',
                      width: '38px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>

              <div style={{ maxWidth: '280px', marginTop: '0.5rem' }}>
                <DurationInput
                  label="Total Duration"
                  mode="seconds"
                  value={draftState.details.durationSeconds}
                  onChange={(_val, totalSeconds) => {
                    updateDetails({ durationSeconds: totalSeconds });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
