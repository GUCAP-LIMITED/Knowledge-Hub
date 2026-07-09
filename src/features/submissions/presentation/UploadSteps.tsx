import { useState, type ReactElement, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Check, FileText, PlusCircle, UploadCloud } from 'lucide-react';
import { Alert, Button, Select, TextField, Textarea } from '@shared/ui';
import { cn } from '@shared/utils';
import { domainResolver } from '@shared/forms';
import { SubmissionTitle } from '../domain';
import styles from './UploadPage.module.css';

const TYPES = [
  'Document',
  'Video',
  'Spreadsheet',
  'Course',
  'Tutorial',
  'Resource',
] as const;
const STEPS = [
  { n: 1, label: 'File' },
  { n: 2, label: 'Details' },
  { n: 3, label: 'Review' },
] as const;

export interface Details {
  title: string;
  type: string;
  description: string;
}
export interface PickedFile {
  name: string;
  size: number;
}
export const EMPTY_DETAILS: Details = { title: '', type: 'Document', description: '' };

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const Stepper = ({ step }: { readonly step: number }): ReactElement => (
  <div className={styles.stepper}>
    {STEPS.map((entry) => (
      <div key={entry.n} className={styles.step}>
        <span className={cn(styles.dot, step >= entry.n && styles.dotActive)}>
          {step > entry.n ? <Check size={14} aria-hidden="true" /> : entry.n}
        </span>
        <span className={cn(styles.stepLabel, step >= entry.n && styles.stepLabelActive)}>
          {entry.label}
        </span>
      </div>
    ))}
  </div>
);

const FileStep = ({
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

const DetailsStep = ({
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
        placeholder="e.g. Updated CV Template"
        error={errors.title?.message ?? ''}
        {...register('title')}
      />
      <Select label="Type" {...register('type')}>
        {TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Textarea
        label="Description"
        rows={4}
        placeholder="Briefly describe this document…"
        {...register('description')}
      />
    </form>
  );
};

const ReviewSummary = ({
  details,
  file,
  isAdmin,
}: {
  readonly details: Details;
  readonly file: PickedFile | null;
  readonly isAdmin: boolean;
}): ReactElement => (
  <dl className={styles.summary}>
    <div>
      <dt>Title</dt>
      <dd>{details.title}</dd>
    </div>
    <div>
      <dt>Type</dt>
      <dd>{details.type}</dd>
    </div>
    <div>
      <dt>File</dt>
      <dd>{file?.name ?? '—'}</dd>
    </div>
    <div>
      <dt>Visibility</dt>
      <dd>{isAdmin ? 'Published immediately' : 'Submitted for review'}</dd>
    </div>
  </dl>
);

export const UploadFooter = ({
  step,
  fileReady,
  isAdmin,
  isSubmitting,
  onBack,
  onContinue,
  onSubmit,
}: {
  readonly step: number;
  readonly fileReady: boolean;
  readonly isAdmin: boolean;
  readonly isSubmitting: boolean;
  readonly onBack: () => void;
  readonly onContinue: () => void;
  readonly onSubmit: () => void;
}): ReactElement => (
  <div className={styles.footer}>
    {step > 1 ? (
      <Button variant="ghost" onClick={onBack}>
        Back
      </Button>
    ) : null}
    {step === 1 ? (
      <Button disabled={!fileReady} onClick={onContinue}>
        Continue
      </Button>
    ) : null}
    {step === 2 ? (
      <Button type="submit" form="upload-details">
        Continue
      </Button>
    ) : null}
    {step === 3 ? (
      <Button isLoading={isSubmitting} onClick={onSubmit}>
        {isAdmin ? 'Publish now' : 'Submit for review'}
      </Button>
    ) : null}
  </div>
);

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
        ? 'Your document is now visible to all users.'
        : 'Admins will review your submission and notify you of the decision.'}
    </p>
    <div className={styles.doneActions}>
      <Button onClick={onReset}>
        <PlusCircle size={16} aria-hidden="true" /> Upload another
      </Button>
    </div>
  </div>
);

export const UploadWizard = ({
  step,
  file,
  onFile,
  details,
  onDetailsSubmit,
  isAdmin,
  submitError,
  footer,
}: {
  readonly step: number;
  readonly file: PickedFile | null;
  readonly onFile: (file: PickedFile | null) => void;
  readonly details: Details;
  readonly onDetailsSubmit: (details: Details) => void;
  readonly isAdmin: boolean;
  readonly submitError?: string | undefined;
  readonly footer: ReactNode;
}): ReactElement => (
  <div className={styles.card}>
    <Stepper step={step} />
    {step === 1 ? <FileStep file={file} onFile={onFile} /> : null}
    {step === 2 ? <DetailsStep defaults={details} onSubmit={onDetailsSubmit} /> : null}
    {step === 3 ? (
      <ReviewSummary details={details} file={file} isAdmin={isAdmin} />
    ) : null}
    {submitError !== undefined ? (
      <Alert tone="error" title="Could not submit">
        {submitError}
      </Alert>
    ) : null}
    {footer}
  </div>
);
