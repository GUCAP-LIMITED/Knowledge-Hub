import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Check, FileText, PlusCircle, UploadCloud } from 'lucide-react';
import { Alert, Button, PageHeader, Select, TextField, Textarea } from '@shared/ui';
import { cn } from '@shared/utils';
import { domainResolver } from '@shared/forms';
import { useAuth } from '@features/auth';
import { SubmissionTitle } from '../domain';
import { useSubmitContent } from './use-submissions';
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
const EMPTY_DETAILS: Details = { title: '', type: 'Document', description: '' };

interface Details {
  title: string;
  type: string;
  description: string;
}
interface PickedFile {
  name: string;
  size: number;
}

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

const UploadFooter = ({
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

const DoneCard = ({
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

/** Upload Document: a 3-step drag-drop create flow that emits a submission. Admin+manager. */
export const UploadPage = (): ReactElement => {
  const { user } = useAuth();
  const submit = useSubmitContent();
  const isAdmin = user?.hasRole('admin') ?? false;
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [done, setDone] = useState(false);

  const reset = (): void => {
    setDone(false);
    setStep(1);
    setFile(null);
    setDetails(EMPTY_DETAILS);
  };

  const doSubmit = (): void => {
    submit.mutate(
      {
        title: details.title,
        type: details.type,
        submittedBy: user?.fullName ?? 'You',
        publishDirectly: isAdmin,
      },
      {
        onSuccess: () => {
          setDone(true);
        },
      },
    );
  };

  if (done) {
    return (
      <section className={styles.screen}>
        <PageHeader title="Upload Document" />
        <DoneCard isAdmin={isAdmin} onReset={reset} />
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Upload Document"
        subtitle={
          isAdmin
            ? 'Publish documents directly to the platform.'
            : 'Submit documents for admin review.'
        }
      />
      <div className={styles.card}>
        <Stepper step={step} />
        {step === 1 ? <FileStep file={file} onFile={setFile} /> : null}
        {step === 2 ? (
          <DetailsStep
            defaults={details}
            onSubmit={(next) => {
              setDetails(next);
              setStep(3);
            }}
          />
        ) : null}
        {step === 3 ? (
          <ReviewSummary details={details} file={file} isAdmin={isAdmin} />
        ) : null}
        {submit.isError ? (
          <Alert tone="error" title="Could not submit">
            {submit.error.message}
          </Alert>
        ) : null}
        <UploadFooter
          step={step}
          fileReady={file !== null}
          isAdmin={isAdmin}
          isSubmitting={submit.isPending}
          onBack={() => {
            setStep(step - 1);
          }}
          onContinue={() => {
            setStep(2);
          }}
          onSubmit={doSubmit}
        />
      </div>
    </section>
  );
};
