import { useState } from 'react';
import { generateGuid } from '@shared/utils';
import { validateFile } from './file-validation';
import { moveInArray, type VideoPlaylistItem } from './upload-content-types';

export interface UseTutorialVideoPlaylistReturn {
  readonly uploadError: string | null;
  readonly handleAddFiles: (fileList: readonly File[]) => void;
  readonly handleAddExternalUrl: (url: string, title?: string) => void;
  readonly handleUpdateTitle: (index: number, newTitle: string) => void;
  readonly handleReorder: (fromIndex: number, delta: number) => void;
  readonly handleRemove: (index: number) => void;
}

export const useTutorialVideoPlaylist = (
  playlist: readonly VideoPlaylistItem[],
  onChange: (playlist: readonly VideoPlaylistItem[]) => void,
): UseTutorialVideoPlaylistReturn => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAddFiles = (fileList: readonly File[]): void => {
    if (fileList.length === 0) return;

    for (const file of fileList) {
      const validation = validateFile(file, 'video');
      if (!validation.valid) {
        setUploadError(validation.error ?? 'Invalid video file format.');
        return;
      }
    }

    setUploadError(null);
    const newItems: VideoPlaylistItem[] = fileList.map((file, idx) => ({
      clientId: generateGuid(),
      file,
      name: file.name,
      sizeBytes: file.size,
      displayOrder: playlist.length + idx,
    }));

    onChange([...playlist, ...newItems].map((v, i) => ({ ...v, displayOrder: i })));
  };

  const handleAddExternalUrl = (url: string, title?: string): void => {
    const trimmedTitle = title?.trim();
    const resolvedTitle =
      trimmedTitle !== undefined && trimmedTitle.length > 0
        ? trimmedTitle
        : `External Video Part ${String(playlist.length + 1)}`;
    const newItem: VideoPlaylistItem = {
      clientId: generateGuid(),
      name: resolvedTitle,
      sizeBytes: 0,
      externalUrl: url,
      displayOrder: playlist.length,
    };

    onChange([...playlist, newItem].map((v, i) => ({ ...v, displayOrder: i })));
  };

  const handleUpdateTitle = (index: number, newTitle: string): void => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const updated = playlist.map((item, idx) =>
      idx === index ? { ...item, name: trimmed } : item,
    );
    onChange(updated);
  };

  const handleReorder = (fromIndex: number, delta: number): void => {
    const reordered = moveInArray(playlist, fromIndex, delta);
    onChange(reordered.map((v, i) => ({ ...v, displayOrder: i })));
  };

  const handleRemove = (index: number): void => {
    const filtered = playlist.filter((_, i) => i !== index);
    onChange(filtered.map((v, i) => ({ ...v, displayOrder: i })));
  };

  return {
    uploadError,
    handleAddFiles,
    handleAddExternalUrl,
    handleUpdateTitle,
    handleReorder,
    handleRemove,
  };
};
