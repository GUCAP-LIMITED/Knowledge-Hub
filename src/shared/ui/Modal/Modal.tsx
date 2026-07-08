import type { ReactElement, ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { IconButton } from '@shared/ui/IconButton/IconButton';
import { fade, popIn } from '@shared/ui/motion/presets';
import styles from './Modal.module.css';

export interface ModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description?: string | undefined;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

const MotionOverlay = motion.create(Dialog.Overlay);
const MotionContent = motion.create(Dialog.Content);

/**
 * Accessible modal dialog. Radix owns focus trapping, `Esc`/overlay dismissal and ARIA wiring;
 * Motion animates the enter/exit (reduced-motion aware via the app-level `MotionConfig`). All
 * styling is token-driven CSS modules — no inline styles.
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ModalProps): ReactElement => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <MotionOverlay
              className={styles.overlay}
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
            <MotionContent
              className={styles.content}
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
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
            </MotionContent>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
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
