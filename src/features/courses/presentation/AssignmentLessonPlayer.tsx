/* eslint-disable max-lines, max-lines-per-function, complexity */
import {
  useState,
  useRef,
  type ReactElement,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileCheck,
  Lock,
} from 'lucide-react';
import { Alert, Badge, Button, ConfirmDialog, Spinner } from '@shared/ui';
import {
  validateFile,
  ACCEPT_ATTRIBUTES,
} from '../../submissions/presentation/file-validation';
import type { CourseMediaAsset, SubmissionFileDto } from '../domain';
import {
  useAssignmentBriefs,
  useLessonSubmission,
  useUploadSubmissionFile,
  useRemoveSubmissionFile,
  useSubmitAndCompleteAssignment,
} from './use-assignment-lesson';

export interface AssignmentLessonPlayerLesson {
  readonly id: string;
  readonly title: string;
  readonly duration?: string | undefined;
  readonly completed?: boolean | undefined;
}

export interface AssignmentLessonPlayerProps {
  readonly courseId?: string | undefined;
  readonly lesson: AssignmentLessonPlayerLesson;
  readonly isEnrolled: boolean;
  readonly onCompleted?: () => void;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AssignmentLessonPlayer = ({
  courseId: propCourseId,
  lesson,
  isEnrolled,
  onCompleted,
}: AssignmentLessonPlayerProps): ReactElement => {
  const { id: routeCourseId } = useParams<{ id: string }>();
  const courseId = propCourseId ?? routeCourseId ?? '';

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Queries
  const { data: briefFiles = [], isLoading: isBriefsLoading } = useAssignmentBriefs(
    courseId,
    lesson.id,
  );

  const { data: submission, isLoading: isSubmissionLoading } = useLessonSubmission(
    courseId,
    lesson.id,
    { enabled: isEnrolled },
  );

  // Mutations
  const uploadMutation = useUploadSubmissionFile(courseId, lesson.id);
  const removeMutation = useRemoveSubmissionFile(courseId, lesson.id);
  const submitMutation = useSubmitAndCompleteAssignment(courseId, lesson.id);

  const isSubmitted = submission?.status === 5;
  const submissionFiles = submission?.files ?? [];

  const handleUploadFiles = async (fileList: FileList | File[]): Promise<void> => {
    if (!isEnrolled || isSubmitted || fileList.length === 0) return;
    setFileError(null);
    setIsUploading(true);

    try {
      for (const file of Array.from(fileList)) {
        const validation = validateFile(file, 'assignment');
        if (!validation.valid) {
          throw new Error(validation.error ?? `Invalid file: ${file.name}`);
        }

        await uploadMutation.mutateAsync(file);
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      void handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      void handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveFile = async (submissionFileId: string): Promise<void> => {
    try {
      setFileError(null);
      await removeMutation.mutateAsync(submissionFileId);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to remove file.');
    }
  };

  const handleConfirmSubmit = async (): Promise<void> => {
    try {
      setFileError(null);
      await submitMutation.mutateAsync();
      setShowSubmitModal(false);
      onCompleted?.();
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Submission failed.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* ── 1. Assignment Title & Status Header ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border)',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-light, rgba(59, 130, 246, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <FileCheck size={22} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {lesson.title}
            </h2>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.2rem',
              }}
            >
              Assignment Lesson &middot; Submission required to complete
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <Badge tone="success" size="md">
            <CheckCircle2 size={14} style={{ marginRight: '0.35rem' }} />
            Submitted
          </Badge>
        ) : isEnrolled ? (
          <Badge tone="warning" size="md">
            <Clock size={14} style={{ marginRight: '0.35rem' }} />
            In Progress
          </Badge>
        ) : (
          <Badge tone="neutral" size="md">
            Preview Mode
          </Badge>
        )}
      </div>

      {fileError && (
        <Alert tone="error" title="Assignment Error">
          {fileError}
        </Alert>
      )}

      {/* ── 2. Brief & Instructions Section ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
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
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Assignment Brief & Resources
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {briefFiles.length} {briefFiles.length === 1 ? 'resource' : 'resources'}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Download the materials and starter documents below. Complete the tasks as
          outlined in the brief before submitting your final work.
        </p>

        {isBriefsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <Spinner size="sm" />
          </div>
        ) : briefFiles.length === 0 ? (
          <div
            style={{
              padding: '1.25rem',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sunken)',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
            }}
          >
            No brief files have been attached to this assignment by the instructor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {briefFiles.map((brief: CourseMediaAsset) => (
              <div
                key={brief.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-sunken)',
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
                  <FileText
                    size={18}
                    style={{ color: 'var(--color-primary)', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={brief.originalFileName}
                    >
                      {brief.originalFileName}
                    </div>
                    <div
                      style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    >
                      {formatFileSize(brief.sizeBytes)} &middot; Course Brief Document
                    </div>
                  </div>
                </div>

                {brief.url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (brief.url) {
                        window.open(brief.url, '_blank', 'noreferrer');
                      }
                    }}
                    title="Open in new tab"
                  >
                    <ExternalLink size={14} />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Learner Submission Section ────────────────────────────────────────────── */}
      {!isEnrolled ? (
        <div
          style={{
            background: 'var(--color-surface-sunken)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <Lock
            size={32}
            style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}
          />
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>
            Enrollment Required
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              maxWidth: '420px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            You are currently viewing a preview. Enroll in this course to submit
            assignments, receive credit, and earn your certificate.
          </p>
        </div>
      ) : isSubmissionLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner size="md" />
        </div>
      ) : isSubmitted ? (
        /* ── Submitted View ── */
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
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
              gap: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          >
            <CheckCircle2
              size={28}
              style={{ color: 'var(--color-success)', flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--color-success)',
                }}
              >
                Assignment Submitted Successfully
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '0.15rem',
                }}
              >
                Your submission was recorded on {formatDate(submission.submittedAt)}. This
                lesson is completed!
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: 'var(--color-text-primary)',
              }}
            >
              Submitted Files ({submissionFiles.length}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {submissionFiles.map((file: SubmissionFileDto) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-sunken)',
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
                    <FileCheck
                      size={18}
                      style={{ color: 'var(--color-success)', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={file.originalFileName}
                      >
                        {file.originalFileName}
                      </div>
                      <div
                        style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                      >
                        {formatFileSize(file.sizeBytes)} &middot; Submitted File
                      </div>
                    </div>
                  </div>

                  {file.readUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (file.readUrl) {
                          window.open(file.readUrl, '_blank', 'noreferrer');
                        }
                      }}
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Draft / In-Progress View ── */
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
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
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Your Assignment Submission
              </h3>
              <p
                style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Upload your completed solution files. When ready, click Submit Assignment
                to finalize.
              </p>
            </div>
            <Badge tone="info" size="sm">
              {submissionFiles.length} {submissionFiles.length === 1 ? 'file' : 'files'}{' '}
              added
            </Badge>
          </div>

          {/* Upload Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
            style={{
              border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem 1rem',
              textAlign: 'center',
              background: dragActive
                ? 'var(--color-surface-hover)'
                : 'var(--color-surface-sunken)',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isUploading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Spinner size="md" />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Uploading file to storage...
                </span>
              </div>
            ) : (
              <>
                <UploadCloud
                  size={32}
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
                  Drag & drop files here, or click to browse
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  Documents, archives, code files, or images (up to 500 MB per file)
                </div>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              accept={ACCEPT_ATTRIBUTES.assignment}
              onChange={handleInputChange}
              disabled={isUploading}
            />
          </div>

          {/* Files List in Draft */}
          {submissionFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Files Attached to Draft:
              </span>
              {submissionFiles.map((file: SubmissionFileDto) => (
                <div
                  key={file.id}
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
                    <FileText
                      size={18}
                      style={{ color: 'var(--color-primary)', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={file.originalFileName}
                      >
                        {file.originalFileName}
                      </div>
                      <div
                        style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                      >
                        {formatFileSize(file.sizeBytes)} &middot; Ready to submit
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {file.readUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (file.readUrl) {
                            window.open(file.readUrl, '_blank', 'noreferrer');
                          }
                        }}
                        title="Preview file"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleRemoveFile(file.id);
                      }}
                      title="Remove file"
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 size={14} style={{ color: 'var(--color-destructive)' }} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submission Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {submissionFiles.length === 0
                ? 'Attach at least one file to submit your assignment.'
                : 'Files will be locked once submitted.'}
            </div>

            <Button
              variant="default"
              size="md"
              onClick={() => {
                setShowSubmitModal(true);
              }}
              disabled={
                submissionFiles.length === 0 || submitMutation.isPending || isUploading
              }
              isLoading={submitMutation.isPending}
            >
              <FileCheck size={16} style={{ marginRight: '0.4rem' }} />
              Submit Assignment
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showSubmitModal}
        title="Submit Assignment"
        description="Are you sure you want to submit your assignment? Once submitted, files cannot be modified."
        confirmLabel="Submit Assignment"
        tone="primary"
        isBusy={submitMutation.isPending}
        onConfirm={() => {
          void handleConfirmSubmit();
        }}
        onCancel={() => {
          setShowSubmitModal(false);
        }}
      />
    </div>
  );
};
