/* eslint-disable max-lines-per-function */
import {
  useState,
  useRef,
  type ReactElement,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { UploadCloud, FileText, Trash2 } from 'lucide-react';
import { Alert, Button, Badge } from '@shared/ui';
import type { Lesson } from './upload-content-types';
import { ACCEPT_ATTRIBUTES, validateFile } from './file-validation';
import styles from './CourseStudioStep.module.css';

export interface AssignmentBriefAreaProps {
  readonly lesson: Lesson;
  readonly updateLesson: (lesson: Lesson) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AssignmentBriefArea = ({
  lesson,
  updateLesson,
}: AssignmentBriefAreaProps): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const files = lesson.assignmentLocalFiles ?? [];

  const handleFiles = (incoming: FileList | File[]): void => {
    setError(null);
    const newFiles: File[] = [];

    for (const file of Array.from(incoming)) {
      const validation = validateFile(file, 'assignment');
      if (!validation.valid) {
        setError(validation.error ?? `Invalid file: ${file.name}`);
        return;
      }
      // Deduplicate by name and size
      const exists = files.some(
        (existing) => existing.name === file.name && existing.size === file.size,
      );
      if (!exists) {
        newFiles.push(file);
      }
    }

    if (newFiles.length > 0) {
      updateLesson({
        ...lesson,
        assignmentLocalFiles: [...files, ...newFiles],
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (index: number): void => {
    const updated = files.filter((_, i) => i !== index);
    updateLesson({
      ...lesson,
      assignmentLocalFiles: updated,
    });
  };

  return (
    <div className={styles.studioMediaArea}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <h3 className={styles.studioMediaTitle} style={{ margin: 0 }}>
            Assignment Brief & Starter Files
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Upload task briefs, starter templates, problem statements, or instructions for
            learners.
          </p>
        </div>
        <Badge tone="info" size="sm">
          {files.length} {files.length === 1 ? 'file' : 'files'} staged
        </Badge>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert tone="error" title="File Error">
            {error}
          </Alert>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem 1rem',
          textAlign: 'center',
          background: isDragging
            ? 'var(--color-surface-hover)'
            : 'var(--color-surface-sunken)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '1rem',
        }}
      >
        <span
          className={styles.dropIconBadge}
          style={{ margin: '0 auto 0.5rem', display: 'flex' }}
        >
          <UploadCloud size={24} className={styles.dropIcon} aria-hidden="true" />
        </span>
        <div
          style={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
          }}
        >
          Click to browse or drop brief files here
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            marginTop: '0.35rem',
          }}
        >
          Supports: PDF, Office docs (Word/Excel/PowerPoint), ZIP, text, and images (Max
          500 MB per file)
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          accept={ACCEPT_ATTRIBUTES.assignment}
          onChange={handleInputChange}
        />
      </div>

      {/* Staged files list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${String(file.size)}-${String(idx)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
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
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-light, rgba(59, 130, 246, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--color-primary)',
                  }}
                >
                  <FileText size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {formatFileSize(file.size)} &middot; Staged for batch upload
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                title="Remove file"
              >
                <Trash2 size={15} style={{ color: 'var(--color-destructive)' }} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
