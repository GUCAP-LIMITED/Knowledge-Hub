import type { ReactElement } from 'react';
import { Ban } from 'lucide-react';
import styles from './UploadCancelledNotice.module.css';

/** Calm confirmation after the user cancels an upload — deliberately not an error alert. */
export const UploadCancelledNotice = (): ReactElement => (
  <div className={styles.notice} role="status">
    <span className={styles.icon}>
      <Ban size={18} aria-hidden="true" />
    </span>
    <div>
      <p className={styles.title}>Upload cancelled</p>
      <p className={styles.body}>
        Nothing was published. Your details are still here, so you can publish again
        whenever you&rsquo;re ready.
      </p>
    </div>
  </div>
);
