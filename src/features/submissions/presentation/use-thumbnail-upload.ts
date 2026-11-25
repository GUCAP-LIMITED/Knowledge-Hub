/* eslint-disable max-lines-per-function */
import {
  useState,
  useRef,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from 'react';
import {
  MEDIA_KIND,
  MEDIA_SLOT,
  useGetMediaReadSas,
  type MediaDraftInput,
} from '@features/content';
import { useContentModule } from '@features/content/presentation/use-content-module';
import { validateFile } from './file-validation';

const MAX_THUMBNAIL_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const validateThumbnailFile = (file: File): string | null => {
  const validation = validateFile(file, 'image');
  if (!validation.valid) {
    return validation.error ?? 'Invalid image file.';
  }
  if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
    return 'Thumbnail file must not exceed 10MB.';
  }
  return null;
};

interface UseThumbnailUploadProps {
  readonly contentId: string;
  readonly liveThumbnailUrl?: string | null | undefined;
  readonly draftMedia?: readonly MediaDraftInput[] | undefined;
  readonly onMediaUpdate: (media: readonly MediaDraftInput[]) => void;
  readonly onThumbnailAssetIdChange?: ((id: string | null) => void) | undefined;
  readonly readOnly: boolean;
}

export interface ThumbnailUploadState {
  readonly fileInputRef: RefObject<HTMLInputElement>;
  readonly isUploading: boolean;
  readonly uploadError: string | null;
  readonly isDragOver: boolean;
  readonly setIsDragOver: (val: boolean) => void;
  readonly activeThumbnailUrl: string | null;
  readonly isSasLoading: boolean;
  readonly isStagedBlob: boolean;
  readonly hasLiveMedia: boolean;
  readonly draftThumbnail?: MediaDraftInput | undefined;
  readonly handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly handleDragOver: (e: DragEvent<HTMLLabelElement>) => void;
  readonly handleDrop: (e: DragEvent<HTMLLabelElement>) => void;
  readonly triggerFileInput: () => void;
}

interface MediaStatusResult {
  readonly isStagedBlob: boolean;
  readonly hasLiveMedia: boolean;
  readonly draftThumbnail?: MediaDraftInput | undefined;
}

const resolveMediaStatus = (
  draftMedia: readonly MediaDraftInput[],
  liveThumbnailUrl: string | null | undefined,
): MediaStatusResult => {
  const draftThumbnail = draftMedia.find((m) => m.slot === MEDIA_SLOT.thumbnail);
  const isStagedBlob = Boolean(draftThumbnail?.azureBlobName);
  const hasDraftPersisted = Boolean(draftThumbnail?.id && !draftThumbnail.azureBlobName);
  const hasLiveFallback = !draftThumbnail && Boolean(liveThumbnailUrl);
  return {
    isStagedBlob,
    hasLiveMedia: hasDraftPersisted || hasLiveFallback,
    draftThumbnail,
  };
};

const resolveActiveUrl = (
  localUrl: string | null,
  sasUrl: string | null | undefined,
  previewUrl: string | null | undefined,
  liveUrl: string | null | undefined,
): string | null => localUrl ?? sasUrl ?? previewUrl ?? liveUrl ?? null;

export const useThumbnailUpload = ({
  contentId,
  liveThumbnailUrl = null,
  draftMedia = [],
  onMediaUpdate,
  onThumbnailAssetIdChange,
  readOnly,
}: UseThumbnailUploadProps): ThumbnailUploadState => {
  const { gateway } = useContentModule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { isStagedBlob, hasLiveMedia, draftThumbnail } = resolveMediaStatus(
    draftMedia,
    liveThumbnailUrl,
  );

  const { data: remoteSasUrl, isLoading: isSasLoading } = useGetMediaReadSas(
    contentId,
    draftThumbnail?.azureBlobName,
  );

  const activeThumbnailUrl = resolveActiveUrl(
    localPreviewUrl,
    remoteSasUrl,
    draftThumbnail?.previewUrl,
    liveThumbnailUrl,
  );

  const handleProcessFile = async (file: File): Promise<void> => {
    if (!contentId) return;

    const fileValidationError = validateThumbnailFile(file);
    if (fileValidationError) {
      setUploadError(fileValidationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);
    setIsUploading(true);
    setUploadError(null);

    const resolvedMime = file.type || 'image/jpeg';

    try {
      const ticket = await gateway.requestUpload(contentId, file.name, resolvedMime);
      await gateway.uploadToBlob(ticket, file);

      const newThumbItem: MediaDraftInput = {
        azureBlobName: ticket.blobName,
        originalFileName: file.name,
        mimeType: resolvedMime,
        sizeBytes: file.size,
        kind: MEDIA_KIND.image,
        slot: MEDIA_SLOT.thumbnail,
        previewUrl: ticket.readUrl ?? localUrl,
      };

      const otherMedia = draftMedia.filter((m) => m.slot !== MEDIA_SLOT.thumbnail);
      onMediaUpdate([...otherMedia, newThumbItem]);
      onThumbnailAssetIdChange?.(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload thumbnail image.',
      );
      setLocalPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    if (!readOnly && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly || isUploading) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const triggerFileInput = (): void => {
    fileInputRef.current?.click();
  };

  return {
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
  };
};
