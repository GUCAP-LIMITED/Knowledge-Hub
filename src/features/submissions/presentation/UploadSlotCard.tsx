import { useState, type ReactElement } from 'react';
import { ChevronDown, ChevronUp, FileText, UploadCloud } from 'lucide-react';
import { Alert, Button } from '@shared/ui';
import { cn } from '@shared/utils';
import { ACCEPT_LABEL, moveInArray, type UploadSlot } from './upload-content-types';
import {
  ACCEPT_ATTRIBUTES,
  type FileCategory,
  validateFileList,
} from './file-validation';
import { RequiredMessage, ShakeOnAttempt } from './RequiredHint';
import { useIsFlagged } from './submit-attempt-context';
import styles from './UploadPage.module.css';

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const toFiles = (list: FileList | null): readonly File[] => [...(list ?? [])];

const mapSlotAcceptToCategory = (accept: UploadSlot['accept']): FileCategory => {
  switch (accept) {
    case 'video':
      return 'video';
    case 'image':
      return 'image';
    case 'single-lesson':
      return 'tutorialPrimary';
    case 'doc':
    case 'any':
    default:
      return 'resource';
  }
};

interface SlotFileChipProps {
  readonly file: File;
  readonly index: number;
  readonly total: number;
  readonly onMoveUp?: (() => void) | undefined;
  readonly onMoveDown?: (() => void) | undefined;
  readonly onRemove: () => void;
}

const SlotFileChip = ({
  file,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SlotFileChipProps): ReactElement => (
  <div className={styles.fileChip}>
    {total > 1 ? <span className={styles.fileIndexBadge}>#{index + 1}</span> : null}
    <FileText size={16} aria-hidden="true" />
    <span className={styles.fileName}>{file.name}</span>
    <span className={styles.fileSize}>{formatSize(file.size)}</span>
    <div className={styles.fileActions}>
      {total > 1 && onMoveUp ? (
        <Button
          variant="ghost"
          size="xs"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label={`Move ${file.name} up`}
        >
          <ChevronUp size={14} />
        </Button>
      ) : null}
      {total > 1 && onMoveDown ? (
        <Button
          variant="ghost"
          size="xs"
          disabled={index === total - 1}
          onClick={onMoveDown}
          aria-label={`Move ${file.name} down`}
        >
          <ChevronDown size={14} />
        </Button>
      ) : null}
      <Button variant="ghost" size="xs" className={styles.fileRemove} onClick={onRemove}>
        Remove
      </Button>
    </div>
  </div>
);

export interface SlotCardProps {
  readonly slot: UploadSlot;
  readonly files: readonly File[];
  readonly onChange: (files: readonly File[]) => void;
}

type SlotZoneState = 'invalid' | 'valid' | 'neutral';

const SlotZone = ({
  slot,
  category,
  state,
  onPick,
}: {
  readonly slot: UploadSlot;
  readonly category: FileCategory;
  readonly state: SlotZoneState;
  readonly onPick: (list: FileList | null) => void;
}): ReactElement => {
  const [drag, setDrag] = useState(false);
  return (
    <label
      className={cn(
        styles.slotZone,
        state === 'invalid' && styles.slotZoneInvalid,
        state === 'valid' && styles.slotZoneValid,
        drag && styles.dropzoneActive,
      )}
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
        onPick(event.dataTransfer.files);
      }}
    >
      <UploadCloud size={22} aria-hidden="true" className={styles.dropIcon} />
      <span className={styles.slotHint}>{drag ? 'Release to upload' : slot.hint}</span>
      <input
        type="file"
        accept={ACCEPT_ATTRIBUTES[category]}
        multiple={slot.single !== true}
        className={styles.fileInput}
        onChange={(event) => {
          const input = event.currentTarget;
          onPick(input.files);
          input.value = '';
        }}
      />
    </label>
  );
};

export const SlotCard = ({ slot, files, onChange }: SlotCardProps): ReactElement => {
  const [fileError, setFileError] = useState<string | null>(null);

  const category = mapSlotAcceptToCategory(slot.accept);
  const required = slot.required === true;
  const missing = required && files.length === 0;
  const flagged = useIsFlagged(missing);

  const add = (list: FileList | null): void => {
    setFileError(null);
    const picked = toFiles(list);
    if (picked.length === 0) {
      return;
    }
    const validation = validateFileList(picked, category);
    if (!validation.valid) {
      setFileError(validation.error ?? 'Invalid file format.');
      return;
    }
    onChange(slot.single === true ? picked.slice(0, 1) : [...files, ...picked]);
  };

  return (
    <div className={styles.slot}>
      <div className={styles.slotHead}>
        <span className={styles.slotLabel}>
          {slot.label}
          {slot.required === true ? <span className={styles.req}> *</span> : null}
        </span>
        <span className={styles.slotAccept}>{ACCEPT_LABEL[slot.accept]}</span>
      </div>
      <ShakeOnAttempt invalid={missing}>
        <SlotZone
          slot={slot}
          category={category}
          state={flagged ? 'invalid' : required && !missing ? 'valid' : 'neutral'}
          onPick={add}
        />
      </ShakeOnAttempt>
      <RequiredMessage invalid={missing}>
        {slot.label} is required. Upload a file to continue.
      </RequiredMessage>
      {fileError && (
        <div style={{ marginTop: '0.75rem' }}>
          <Alert tone="error" title="Unsupported File">
            {fileError}
          </Alert>
        </div>
      )}
      {files.map((file, index) => (
        <SlotFileChip
          key={`${file.name}-${String(index)}`}
          file={file}
          index={index}
          total={files.length}
          onMoveUp={
            index > 0
              ? () => {
                  onChange(moveInArray(files, index, -1));
                }
              : undefined
          }
          onMoveDown={
            index < files.length - 1
              ? () => {
                  onChange(moveInArray(files, index, 1));
                }
              : undefined
          }
          onRemove={() => {
            onChange(files.filter((_, i) => i !== index));
          }}
        />
      ))}
    </div>
  );
};
