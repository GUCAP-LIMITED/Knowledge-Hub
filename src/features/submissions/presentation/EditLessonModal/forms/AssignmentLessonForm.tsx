/* eslint-disable max-lines-per-function */
import { useState, useRef, type ReactElement, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, UploadCloud } from 'lucide-react';
import { BaseLessonFields, type BaseLessonFieldsProps } from './BaseLessonFields';
import { Alert, Badge } from '@shared/ui';
import { generateGuid } from '@shared/utils';
import { ACCEPT_ATTRIBUTES, validateFile } from '../../file-validation';
import { useContentModule } from '@features/content/presentation/use-content-module';
import { MEDIA_KIND, MEDIA_SLOT, type MediaDraftInput } from '@features/content';
import { type CourseMediaAsset } from '@features/courses';
import { resolveDocumentMimeType } from './document-lesson-utils';
import { AssignmentBriefFileList } from './AssignmentBriefFileList';

export const AssignmentLessonForm = ({
  draft,
  setDraft,
}: BaseLessonFieldsProps): ReactElement => {
  const { id: contentId } = useParams<{ id: string }>();
  const { gateway } = useContentModule();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentFiles: readonly MediaDraftInput[] = draft.assignmentFiles ?? [];

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0 || !contentId) return;

    setUploadError(null);
    setIsProcessing(true);

    try {
      const newItems: MediaDraftInput[] = [];
      for (const file of Array.from(selectedFiles)) {
        const validation = validateFile(file, 'assignment');
        if (!validation.valid) {
          throw new Error(validation.error ?? `Invalid file: ${file.name}`);
        }

        const mimeType = resolveDocumentMimeType(file.name, file.type);
        const ticket = await gateway.requestUpload(contentId, file.name, mimeType);
        await gateway.uploadToBlob(ticket, file);

        newItems.push({
          id: generateGuid(),
          azureBlobName: ticket.blobName,
          originalFileName: file.name,
          mimeType,
          sizeBytes: file.size,
          kind: file.type.startsWith('image/') ? MEDIA_KIND.image : MEDIA_KIND.document,
          slot: MEDIA_SLOT.courseAssignmentBrief,
          previewUrl: ticket.readUrl,
        });
      }

      setDraft((d) => ({
        ...d,
        assignmentFiles: [...(d.assignmentFiles ?? []), ...newItems],
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload brief file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (mediaAssetIdOrBlobName: string): void => {
    setUploadError(null);
    setDraft((d) => ({
      ...d,
      assignmentFiles: (d.assignmentFiles ?? []).filter(
        (f) =>
          f.id !== mediaAssetIdOrBlobName && f.azureBlobName !== mediaAssetIdOrBlobName,
      ),
    }));
  };

  const briefFilesForList: CourseMediaAsset[] = currentFiles.map((f) => ({
    id: f.id ?? f.azureBlobName,
    slot: f.slot,
    kind: f.kind,
    originalFileName: f.originalFileName,
    mimeType: f.mimeType,
    sizeBytes: f.sizeBytes,
    url: f.previewUrl,
    azureBlobName: f.azureBlobName,
  }));

  return (
    <>
      <BaseLessonFields draft={draft} setDraft={setDraft} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginTop: '0.75rem',
          padding: '1.25rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
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
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Assignment Brief & Instructions
            </h4>
          </div>
          <Badge tone="info" size="sm">
            {briefFilesForList.length} {briefFilesForList.length === 1 ? 'file' : 'files'}{' '}
            attached
          </Badge>
        </div>

        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Attach task briefs, problem statements, rubrics, or starter kits that learners
          can download when working on this assignment.
        </p>

        {uploadError && (
          <Alert tone="error" title="Error">
            {uploadError}
          </Alert>
        )}

        {/* Upload Action Area */}
        <div
          onClick={() => {
            if (!isProcessing) fileInputRef.current?.click();
          }}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            background: 'var(--color-surface-sunken)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          {isProcessing ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid var(--color-border)',
                  borderTopColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Uploading brief file to storage...
              </span>
            </div>
          ) : (
            <>
              <UploadCloud
                size={28}
                style={{
                  color: 'var(--color-primary)',
                  margin: '0 auto 0.5rem',
                  display: 'block',
                }}
              />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                Click to browse and upload brief files
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                PDF, Word, Excel, PowerPoint, ZIP, code, or images (up to 500 MB)
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            accept={ACCEPT_ATTRIBUTES.assignment}
            onChange={(e) => {
              void handleFileSelect(e);
            }}
            disabled={isProcessing}
          />
        </div>

        {/* Existing Brief Files */}
        <AssignmentBriefFileList
          briefFiles={briefFilesForList}
          contentId={contentId}
          isLoading={false}
          isRemoving={false}
          onRemove={handleRemove}
        />
      </div>
    </>
  );
};
