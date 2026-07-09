import type { ReactElement, ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { IconButton } from '@shared/ui/IconButton/IconButton';
import { cn } from '@shared/utils';
import styles from './Modal.module.css';

export interface ModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description?: string | undefined;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: 'md' | 'lg';
}

/**
 * Accessible modal dialog. Radix owns focus trapping, `Esc`/overlay dismissal and ARIA wiring; the
 * enter transition is a plain CSS animation keyed off Radix's `data-state` (no JS animation library),
 * so the content is always painted at full opacity even if the animation is skipped. Styling is
 * token-driven CSS Modules — no inline styles.
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps): ReactElement => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={cn(styles.content, size === 'lg' && styles.lg)}>
          <header className={styles.header}>
            <div className={styles.heading}>
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              {description !== undefined ? (
                <Dialog.Description className={styles.description}>
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <IconButton label="Close dialog">
                <CloseIcon />
              </IconButton>
            </Dialog.Close>
          </header>

          <div className={styles.body}>{children}</div>

          {footer !== undefined ? (
            <footer className={styles.footer}>{footer}</footer>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const CloseIcon = (): ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
