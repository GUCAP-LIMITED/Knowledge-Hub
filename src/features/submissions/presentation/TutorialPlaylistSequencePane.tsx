/* eslint-disable max-lines */
import { useState, type ReactElement } from 'react';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  ExternalLink,
  PlayCircle,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { VideoPlaylistItem } from './upload-content-types';
import styles from './TutorialVideoPlaylistBuilder.module.css';

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const getDomain = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'External';
  }
};

interface PlaylistItemTitleEditorProps {
  readonly editingDraft: string;
  readonly index: number;
  readonly onDraftChange: (value: string) => void;
  readonly onSaveEdit: () => void;
  readonly onCancelEdit: () => void;
}

const PlaylistItemTitleEditor = ({
  editingDraft,
  index,
  onDraftChange,
  onSaveEdit,
  onCancelEdit,
}: PlaylistItemTitleEditorProps): ReactElement => (
  <div
    className={styles.titleEditRow}
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
    <input
      type="text"
      className={styles.titleInput}
      value={editingDraft}
      onChange={(e) => {
        onDraftChange(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSaveEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancelEdit();
        }
      }}
      onBlur={(e) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (related?.closest('[data-title-action]')) {
          return;
        }
        onSaveEdit();
      }}
      placeholder="Enter title..."
      aria-label={`Title for part ${String(index + 1)}`}
      autoFocus
    />
    <Button
      type="button"
      data-title-action="save"
      variant="ghost"
      size="xs"
      onClick={onSaveEdit}
      aria-label={`Save title for part ${String(index + 1)}`}
      style={{ color: 'var(--color-success, #10b981)', padding: '0.15rem' }}
    >
      <Check size={14} />
    </Button>
    <Button
      type="button"
      data-title-action="cancel"
      variant="ghost"
      size="xs"
      onClick={onCancelEdit}
      aria-label={`Cancel editing title for part ${String(index + 1)}`}
      style={{ color: 'var(--color-text-muted)', padding: '0.15rem' }}
    >
      <X size={14} />
    </Button>
  </div>
);

interface PlaylistItemActionsProps {
  readonly index: number;
  readonly totalCount: number;
  readonly isEditingTitle: boolean;
  readonly onStartEdit: () => void;
  readonly onCancelEdit: () => void;
  readonly onReorder: (fromIndex: number, delta: number) => void;
  readonly onRemove: (index: number) => void;
}

const PlaylistItemActions = ({
  index,
  totalCount,
  isEditingTitle,
  onStartEdit,
  onCancelEdit,
  onReorder,
  onRemove,
}: PlaylistItemActionsProps): ReactElement => (
  <div className={styles.itemActions}>
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={() => {
        if (isEditingTitle) {
          onCancelEdit();
        } else {
          onStartEdit();
        }
      }}
      aria-label={`Edit title for part ${String(index + 1)}`}
      title="Edit title"
      style={isEditingTitle ? { color: 'var(--color-primary)' } : undefined}
    >
      <Pencil size={14} />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={index === 0}
      onClick={() => {
        onReorder(index, -1);
      }}
      aria-label={`Move part ${String(index + 1)} up`}
    >
      <ChevronUp size={14} />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={index === totalCount - 1}
      onClick={() => {
        onReorder(index, 1);
      }}
      aria-label={`Move part ${String(index + 1)} down`}
    >
      <ChevronDown size={14} />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={() => {
        onRemove(index);
      }}
      aria-label={`Remove part ${String(index + 1)}`}
      style={{ color: 'var(--color-danger, #ef4444)' }}
    >
      <Trash2 size={14} />
    </Button>
  </div>
);

interface PlaylistItemRowProps {
  readonly item: VideoPlaylistItem;
  readonly index: number;
  readonly totalCount: number;
  readonly isEditingTitle: boolean;
  readonly editingDraft: string;
  readonly onDraftChange: (value: string) => void;
  readonly onStartEdit: () => void;
  readonly onSaveEdit: () => void;
  readonly onCancelEdit: () => void;
  readonly onReorder: (fromIndex: number, delta: number) => void;
  readonly onRemove: (index: number) => void;
}

const PlaylistItemRow = ({
  item,
  index,
  totalCount,
  isEditingTitle,
  editingDraft,
  onDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onReorder,
  onRemove,
}: PlaylistItemRowProps): ReactElement => (
  <div className={styles.playlistItem}>
    <div className={styles.itemLeft}>
      <span className={styles.orderBadge}>#{index + 1}</span>
      <div className={styles.itemInfo}>
        {isEditingTitle ? (
          <PlaylistItemTitleEditor
            editingDraft={editingDraft}
            index={index}
            onDraftChange={onDraftChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        ) : (
          <span className={styles.itemTitle}>{item.name}</span>
        )}
        {item.externalUrl ? (
          <div className={styles.itemMeta}>
            <span>{getDomain(item.externalUrl)}</span>
            <span>·</span>
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openLink}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <ExternalLink size={12} />
              Open
            </a>
          </div>
        ) : (
          <div className={styles.itemMeta}>
            <span>File</span>
            <span>·</span>
            <span>{formatSize(item.sizeBytes)}</span>
          </div>
        )}
      </div>
    </div>

    <PlaylistItemActions
      index={index}
      totalCount={totalCount}
      isEditingTitle={isEditingTitle}
      onStartEdit={onStartEdit}
      onCancelEdit={onCancelEdit}
      onReorder={onReorder}
      onRemove={onRemove}
    />
  </div>
);

export interface TutorialPlaylistSequencePaneProps {
  readonly playlist: readonly VideoPlaylistItem[];
  readonly isInvalid: boolean;
  readonly onAddVideoPart: () => void;
  readonly onUpdateTitle: (index: number, newTitle: string) => void;
  readonly onReorder: (fromIndex: number, delta: number) => void;
  readonly onRemove: (index: number) => void;
}

export const TutorialPlaylistSequencePane = ({
  playlist,
  isInvalid,
  onAddVideoPart,
  onUpdateTitle,
  onReorder,
  onRemove,
}: TutorialPlaylistSequencePaneProps): ReactElement => {
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [editingTitleDraft, setEditingTitleDraft] = useState('');

  const handleStartEdit = (index: number, currentName: string): void => {
    setEditingTitleIndex(index);
    setEditingTitleDraft(currentName);
  };

  const handleSaveEdit = (index: number): void => {
    const trimmed = editingTitleDraft.trim();
    if (trimmed.length > 0) {
      onUpdateTitle(index, trimmed);
    }
    setEditingTitleIndex(null);
    setEditingTitleDraft('');
  };

  const handleCancelEdit = (): void => {
    setEditingTitleIndex(null);
    setEditingTitleDraft('');
  };

  const handleRemoveItem = (index: number): void => {
    if (editingTitleIndex === index) {
      handleCancelEdit();
    } else if (editingTitleIndex !== null && editingTitleIndex > index) {
      setEditingTitleIndex(editingTitleIndex - 1);
    }
    onRemove(index);
  };

  return (
    <div className={cn(styles.rightPane, isInvalid && styles.borderInvalid)}>
      <div className={styles.rightPaneHeader}>
        <h4 className={styles.paneTitle}>
          Playlist Sequence ({playlist.length} {playlist.length === 1 ? 'part' : 'parts'})
        </h4>
        <Button type="button" variant="outline" size="sm" onClick={onAddVideoPart}>
          <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Video Part
        </Button>
      </div>

      {playlist.length === 0 ? (
        <div className={styles.playlistEmpty}>
          <PlayCircle size={38} style={{ color: 'var(--color-text-muted)' }} />
          <h5 className={styles.emptyTitle}>No videos in playlist</h5>
          <p className={styles.emptyDesc}>
            Upload one or more video files or add an external URL to assemble your
            playback sequence.
          </p>
        </div>
      ) : (
        <div className={styles.playlistList}>
          {playlist.map((item, idx) => (
            <PlaylistItemRow
              key={item.clientId}
              item={item}
              index={idx}
              totalCount={playlist.length}
              isEditingTitle={editingTitleIndex === idx}
              editingDraft={editingTitleDraft}
              onDraftChange={setEditingTitleDraft}
              onStartEdit={() => {
                handleStartEdit(idx, item.name);
              }}
              onSaveEdit={() => {
                handleSaveEdit(idx);
              }}
              onCancelEdit={handleCancelEdit}
              onReorder={onReorder}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
