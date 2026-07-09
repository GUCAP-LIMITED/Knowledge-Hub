import { useState, type ReactElement } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { cn } from '@shared/utils';
import {
  ACCEPT_LABEL,
  type PickedFile,
  type SlotFiles,
  type UploadSlot,
} from './upload-content-types';
import styles from './UploadPage.module.css';

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const toPicked = (list: FileList | null): readonly PickedFile[] =>
  [...(list ?? [])].map((file) => ({ name: file.name, size: file.size }));

const SlotCard = ({
  slot,
  files,
  onChange,
}: {
  readonly slot: UploadSlot;
  readonly files: readonly PickedFile[];
  readonly onChange: (files: readonly PickedFile[]) => void;
}): ReactElement => {
  const [drag, setDrag] = useState(false);
  const add = (list: FileList | null): void => {
    const picked = toPicked(list);
    if (picked.length === 0) {
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
      <label
        className={cn(styles.slotZone, drag && styles.dropzoneActive)}
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
          add(event.dataTransfer.files);
        }}
      >
        <UploadCloud size={22} aria-hidden="true" className={styles.dropIcon} />
        <span className={styles.slotHint}>{drag ? 'Release to upload' : slot.hint}</span>
        <input
          type="file"
          multiple={slot.single !== true}
          className={styles.fileInput}
          onChange={(event) => {
            add(event.target.files);
          }}
        />
      </label>
      {files.map((file, index) => (
        <div key={`${file.name}-${String(index)}`} className={styles.fileChip}>
          <FileText size={16} aria-hidden="true" />
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatSize(file.size)}</span>
          <button
            type="button"
            className={styles.fileRemove}
            onClick={() => {
              onChange(files.filter((_, i) => i !== index));
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export interface UploadFileStepProps {
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly onChange: (files: SlotFiles) => void;
}

/** Type-aware upload step — one dropzone card per named slot. */
export const UploadFileStep = ({
  slots,
  files,
  onChange,
}: UploadFileStepProps): ReactElement => (
  <div className={styles.slotGrid}>
    {slots.map((slot) => (
      <SlotCard
        key={slot.id}
        slot={slot}
        files={files[slot.id] ?? []}
        onChange={(next) => {
          onChange({ ...files, [slot.id]: next });
        }}
      />
    ))}
  </div>
);
