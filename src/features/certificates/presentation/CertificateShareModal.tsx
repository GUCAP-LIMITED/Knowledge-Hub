import { useState, type FocusEvent, type ReactElement, type ReactNode } from 'react';
import { Check, Link2, Mail } from 'lucide-react';
import { IconButton, Modal, TextField } from '@shared/ui';
import type { Certificate } from '../domain';
import { LinkedInIcon, WhatsAppIcon, XIcon } from './BrandIcons';
import { shareText, verifyUrl } from './certificate-view';
import styles from './CertificateShareModal.module.css';

export interface CertificateShareModalProps {
  readonly certificate: Certificate | null;
  readonly onClose: () => void;
}

interface ShareOption {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onSelect: () => void;
}

const openShareWindow = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/** Platform tiles: each opens that platform's own share dialog pre-filled with the certificate's
 * public verify URL. */
const buildShareOptions = (certificate: Certificate): readonly ShareOption[] => {
  const url = verifyUrl(certificate);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText(certificate));

  return [
    {
      label: 'LinkedIn',
      icon: <LinkedInIcon size={20} />,
      onSelect: () => {
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        );
      },
    },
    {
      label: 'X',
      icon: <XIcon size={20} />,
      onSelect: () => {
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        );
      },
    },
    {
      label: 'WhatsApp',
      icon: <WhatsAppIcon size={20} />,
      onSelect: () => {
        openShareWindow(`https://wa.me/?text=${encodedText}%20${encodedUrl}`);
      },
    },
    {
      label: 'Email',
      icon: <Mail size={20} aria-hidden="true" />,
      onSelect: () => {
        const subject = encodeURIComponent('My UAPP Academy certificate');
        window.location.href = `mailto:?subject=${subject}&body=${encodedText}%20${encodedUrl}`;
      },
    },
  ];
};

const selectFieldValue = (event: FocusEvent<HTMLInputElement>): void => {
  event.target.select();
};

/** Share dialog for a certificate: platform tiles plus a copyable link to the public verify page. */
export const CertificateShareModal = ({
  certificate,
  onClose,
}: CertificateShareModalProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  const url = certificate !== null ? verifyUrl(certificate) : '';

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Modal
      open={certificate !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="Share certificate"
      description={
        certificate !== null
          ? `Share "${certificate.courseName}" with others.`
          : undefined
      }
    >
      {certificate !== null ? (
        <div className={styles.body}>
          <div className={styles.grid}>
            {buildShareOptions(certificate).map((option) => (
              <button
                key={option.label}
                type="button"
                className={styles.tile}
                onClick={option.onSelect}
              >
                <span className={styles.tileIcon}>{option.icon}</span>
                <span className={styles.tileLabel}>{option.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.copyRow}>
            <TextField
              label="Certificate link"
              value={url}
              readOnly
              onFocus={selectFieldValue}
              className={styles.copyInput}
            />
            <IconButton
              label={copied ? 'Copied' : 'Copy link'}
              className={styles.copyButton}
              onClick={handleCopy}
            >
              {copied ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Link2 size={16} aria-hidden="true" />
              )}
            </IconButton>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
