import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import type { ContentStatus, ContentType } from '../domain';
import { STATUS_LABELS } from './content-filter';
import styles from './ContentManagementPage.module.css';

const TYPES: readonly ContentType[] = [
  'Article',
  'Course',
  'Tutorial',
  'Document',
  'Resource',
];
const STATUSES: readonly ContentStatus[] = ['draft', 'review', 'published'];

export interface ContentFormFieldsProps {
  readonly title: string;
  readonly type: ContentType;
  readonly status: ContentStatus;
  readonly error: string;
  readonly onTitle: (value: string) => void;
  readonly onType: (value: ContentType) => void;
  readonly onStatus: (value: ContentStatus) => void;
}

/** The title/type/status fields shared by the create and edit modal states. */
export const ContentFormFields = ({
  title,
  type,
  status,
  error,
  onTitle,
  onType,
  onStatus,
}: ContentFormFieldsProps): ReactElement => (
  <div className={styles.formFields}>
    <TextField
      label="Title"
      placeholder="Enter content title…"
      value={title}
      error={error}
      onChange={(event) => {
        onTitle(event.target.value);
      }}
    />
    <Select
      label="Type"
      value={type}
      onChange={(event) => {
        onType(event.target.value as ContentType);
      }}
    >
      {TYPES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
    <Select
      label="Status"
      value={status}
      onChange={(event) => {
        onStatus(event.target.value as ContentStatus);
      }}
    >
      {STATUSES.map((option) => (
        <option key={option} value={option}>
          {STATUS_LABELS[option]}
        </option>
      ))}
    </Select>
  </div>
);
