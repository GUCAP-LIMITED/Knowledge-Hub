import { useState, type ReactElement } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Alert, Button, VideoPlayer } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Lesson } from './upload-content-types';
import { RequiredMessage, ShakeOnAttempt } from './RequiredHint';
import { useIsFlagged } from './submit-attempt-context';
import { ACCEPT_ATTRIBUTES, ALLOWED_EXTENSIONS, validateFile } from './file-validation';
import styles from './CourseStudioStep.module.css';

export interface LessonMediaAreaProps {
  readonly lesson: Lesson;
  readonly updateLesson: (lesson: Lesson) => void;
}

const MediaDropzone = ({
  lesson,
  category,
  onPick,
}: {
  readonly lesson: Lesson;
  readonly category: 'video' | 'document';
  /** Returns false when the file was rejected, so the input can be cleared. */
  readonly onPick: (file: File) => boolean;
}): ReactElement => {
  const flagged = useIsFlagged(true);
  return (
    <label className={cn(styles.studioDropzone, flagged && styles.studioDropzoneInvalid)}>
      <span className={styles.dropIconBadge}>
        <Upload size={22} className={styles.dropIcon} aria-hidden="true" />
      </span>
      <span className={styles.dropTitle}>
        Click to upload {lesson.kind === 'video' ? 'Video' : 'Document (PDF / Office)'}
      </span>
      <span className={styles.dropHint}>{ALLOWED_EXTENSIONS[category].join(', ')}</span>
      <input
        type="file"
        style={{ display: 'none' }}
        accept={ACCEPT_ATTRIBUTES[category]}
        onChange={(e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (file && !onPick(file)) {
            input.value = '';
          }
        }}
      />
    </label>
  );
};

export const LessonMediaArea = ({
  lesson,
  updateLesson,
}: LessonMediaAreaProps): ReactElement | null => {
  const [fileError, setFileError] = useState<string | null>(null);

  if (lesson.kind !== 'video' && lesson.kind !== 'pdf') {
    return null;
  }

  const category = lesson.kind === 'video' ? 'video' : 'document';

  return (
    <div className={styles.studioMediaArea}>
      <h3 className={styles.studioMediaTitle}>Lesson Media</h3>
      {fileError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert tone="error" title="Unsupported File">
            {fileError}
          </Alert>
        </div>
      )}
      {lesson.file && lesson.file instanceof File ? (
        <div className={styles.studioMediaPreview}>
          {lesson.kind === 'video' ? (
            <VideoPlayer src={URL.createObjectURL(lesson.file)} title={lesson.title} />
          ) : (
            <div className={styles.studioPdfPreview}>
              <FileText size={48} />
              <p>{lesson.file.name}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setFileError(null);
              const { file: _file, ...rest } = lesson;
              updateLesson(rest);
            }}
            style={{ marginTop: '1rem' }}
          >
            Remove Media
          </Button>
        </div>
      ) : (
        <ShakeOnAttempt invalid>
          <MediaDropzone
            lesson={lesson}
            category={category}
            onPick={(file) => {
              const validation = validateFile(file, category);
              if (!validation.valid) {
                setFileError(validation.error ?? 'Invalid file format.');
                return false;
              }
              setFileError(null);
              updateLesson({ ...lesson, file });
              return true;
            }}
          />
        </ShakeOnAttempt>
      )}
      <RequiredMessage invalid={!lesson.file}>
        Upload a {lesson.kind === 'video' ? 'video' : 'document'} for this lesson.
      </RequiredMessage>
    </div>
  );
};
