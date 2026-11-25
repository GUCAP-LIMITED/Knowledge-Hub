import { useRef, type ChangeEvent, type ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { IconButton } from '@shared/ui';
import styles from './CertificateTemplatesManager.module.css';

export interface CertificateBackgroundFieldProps {
  /** Whether a custom (non-shipped) background is in place — only then is there anything to
   * remove, since removing falls back to the kind's shipped default. */
  readonly canRemove: boolean;
  readonly onChange: (dataUrl: string) => void;
  readonly onRemove: () => void;
}

const readAsDataUrl = (file: File, onLoaded: (dataUrl: string) => void): void => {
  const reader = new FileReader();
  reader.onload = (): void => {
    if (typeof reader.result === 'string') {
      onLoaded(reader.result);
    }
  };
  reader.readAsDataURL(file);
};

/**
 * The single background-image upload for one certificate design — carries every static asset
 * (artwork, logo, seal, signature, copy). Only the name/course-name/QR overlay elements stay
 * separately editable on the canvas. Each kind starts from its shipped background; uploading
 * replaces it, removing reverts to it.
 */
export const CertificateBackgroundField = ({
  canRemove,
  onChange,
  onRemove,
}: CertificateBackgroundFieldProps): ReactElement => {
  // The file input is uncontrolled — reverting the background in the store doesn't reset its
  // displayed filename, since React never touches an <input type="file">'s value on re-render.
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file !== undefined) {
      readAsDataUrl(file, onChange);
    }
  };

  const handleRemove = (): void => {
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
    onRemove();
  };

  return (
    <div className={styles.uploadRow}>
      <label className={styles.uploadLabel}>
        <span>Replace background</span>
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} />
      </label>
      {canRemove ? (
        <IconButton label="Remove background" onClick={handleRemove}>
          <Trash2 size={16} aria-hidden="true" />
        </IconButton>
      ) : null}
    </div>
  );
};
