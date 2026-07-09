import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Check, FileText, PlusCircle, UploadCloud } from 'lucide-react';
import { Button, TextField, Textarea } from '@shared/ui';
import { cn } from '@shared/utils';
import { domainResolver } from '@shared/forms';
import { SubmissionTitle } from '../domain';
import type { Section } from './upload-content-types';
import styles from './UploadPage.module.css';

export interface Details {
  title: string;
  type: string;
  description: string;
}
export interface PickedFile {
  name: string;
  size: number;
}

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const FileStep = ({
  file,
  onFile,
}: {
  readonly file: PickedFile | null;
  readonly onFile: (file: PickedFile | null) => void;
}): ReactElement => {
  const [drag, setDrag] = useState(false);
  const pick = (list: FileList | null): void => {
    const first = list?.[0];
    if (first) {
      onFile({ name: first.name, size: first.size });
    }
  };
  return (
    <div>
      <label
        className={cn(styles.dropzone, drag && styles.dropzoneActive)}
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => {
          setDrag(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          pick(event.dataTransfer.files);
        }}
      >
        <UploadCloud size={34} aria-hidden="true" className={styles.dropIcon} />
        <span className={styles.dropTitle}>
          {drag ? 'Release to upload' : 'Drag & drop a file, or browse'}
        </span>
        <span className={styles.dropHint}>
          PDF, DOCX, XLSX, PPTX, MP4 or image · up to 50MB
        </span>
        <input
          type="file"
          className={styles.fileInput}
          onChange={(event) => {
            pick(event.target.files);
          }}
        />
      </label>
      {file !== null ? (
        <div className={styles.fileChip}>
          <FileText size={18} aria-hidden="true" />
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatSize(file.size)}</span>
          <button
            type="button"
            className={styles.fileRemove}
            onClick={() => {
              onFile(null);
            }}
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const DetailsStep = ({
  defaults,
  onSubmit,
}: {
  readonly defaults: Details;
  readonly onSubmit: (details: Details) => void;
}): ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Details>({
    resolver: domainResolver<Details>({
      title: (value) => SubmissionTitle.create(value),
    }),
    defaultValues: defaults,
  });
  return (
    <form
      id="upload-details"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className={styles.form}
    >
      <TextField
        label="Title"
        placeholder="e.g. Getting Started with UAPP Portal"
        error={errors.title?.message ?? ''}
        {...register('title')}
      />
      <Textarea
        label="Description"
        rows={4}
        placeholder="Briefly describe this content…"
        {...register('description')}
      />
    </form>
  );
};

export const ReviewSummary = ({
  details,
  file,
  isAdmin,
  sections,
}: {
  readonly details: Details;
  readonly file: PickedFile | null;
  readonly isAdmin: boolean;
  readonly sections: readonly Section[] | null;
}): ReactElement => {
  const lessonCount = (sections ?? []).reduce((n, s) => n + s.lessons.length, 0);
  return (
    <dl className={styles.summary}>
      <div>
        <dt>Type</dt>
        <dd>{details.type}</dd>
      </div>
      <div>
        <dt>Title</dt>
        <dd>{details.title}</dd>
      </div>
      <div>
        <dt>File</dt>
        <dd>{file?.name ?? '—'}</dd>
      </div>
      {sections !== null ? (
        <div>
          <dt>Curriculum</dt>
          <dd>
            {sections.length} section{sections.length === 1 ? '' : 's'} · {lessonCount}{' '}
            lesson{lessonCount === 1 ? '' : 's'}
          </dd>
        </div>
      ) : null}
      <div>
        <dt>Visibility</dt>
        <dd>{isAdmin ? 'Published immediately' : 'Submitted for review'}</dd>
      </div>
    </dl>
  );
};

export const DoneCard = ({
  isAdmin,
  onReset,
}: {
  readonly isAdmin: boolean;
  readonly onReset: () => void;
}): ReactElement => (
  <div className={cn(styles.card, styles.doneCard)}>
    <span className={styles.doneIcon}>
      <Check size={34} aria-hidden="true" />
    </span>
    <h2 className={styles.doneTitle}>
      {isAdmin ? 'Published successfully' : 'Submitted for review'}
    </h2>
    <p className={styles.doneText}>
      {isAdmin
        ? 'Your content is now visible to all users.'
        : 'Admins will review your submission and notify you of the decision.'}
    </p>
    <div className={styles.doneActions}>
      <Button onClick={onReset}>
        <PlusCircle size={16} aria-hidden="true" /> Upload another
      </Button>
    </div>
  </div>
);
