import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { Button, IconButton, ProgressBar } from '@shared/ui';
import { cn, useDraggablePosition } from '@shared/utils';
import { useUploadQueueStore, type UploadJob } from '../store';
import {
  cancelUploadJob,
  dismissAllUploadJobs,
  dismissUploadJob,
  retryUploadJob,
} from './upload-job-runner';
import styles from './UploadProgressWidget.module.css';

const percentFor = (job: UploadJob): number =>
  job.totalFiles === 0 ? 100 : Math.round((job.completedFiles / job.totalFiles) * 100);

const statusText = (job: UploadJob): string => {
  if (job.status === 'error') return job.errorMessage ?? 'Upload failed.';
  if (job.status === 'cancelling') return 'Cancelling…';
  if (job.status === 'cancelled') return job.errorMessage ?? 'Upload cancelled.';
  if (job.status === 'done') {
    return `Done — ${String(job.totalFiles)} file${job.totalFiles === 1 ? '' : 's'} uploaded`;
  }
  return `Uploading… ${String(job.completedFiles)}/${String(job.totalFiles)} files — ${String(percentFor(job))}% completed`;
};

const isRunning = (job: UploadJob): boolean =>
  job.status === 'uploading' || job.status === 'cancelling';

const StatusIcon = ({
  status,
}: {
  readonly status: UploadJob['status'];
}): ReactElement => {
  if (status === 'done') {
    return (
      <span className={cn(styles.icon, styles.done)}>
        <CheckCircle2 size={16} aria-hidden />
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className={cn(styles.icon, styles.error)}>
        <AlertCircle size={16} aria-hidden />
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className={cn(styles.icon, styles.cancelled)}>
        <Ban size={16} aria-hidden />
      </span>
    );
  }
  return (
    <span className={cn(styles.icon, styles.uploading)}>
      <Loader2 size={16} className={styles.spin} aria-hidden />
    </span>
  );
};

/** Cancel while running; Retry once it failed or was cancelled. */
const JobActions = ({
  job,
  wasDragged,
}: {
  readonly job: UploadJob;
  readonly wasDragged: () => boolean;
}): ReactElement | null => {
  if (job.status === 'uploading') {
    return (
      <div className={styles.actions}>
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            if (!wasDragged()) cancelUploadJob(job.id);
          }}
        >
          <Ban aria-hidden /> Cancel upload
        </Button>
      </div>
    );
  }
  if (job.status === 'error' || job.status === 'cancelled') {
    return (
      <div className={styles.actions}>
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            if (!wasDragged()) retryUploadJob(job.id);
          }}
        >
          <RotateCcw aria-hidden /> Retry
        </Button>
      </div>
    );
  }
  return null;
};

interface JobCardProps {
  readonly job: UploadJob;
  readonly wasDragged: () => boolean;
  /** Minimize + close — rendered inside the card when it is the only job, so the whole widget
   * reads as one card instead of a card under a separate control strip. */
  readonly widgetControls?: ReactElement;
}

const JobCard = ({ job, wasDragged, widgetControls }: JobCardProps): ReactElement => (
  <div className={styles.card} role="status">
    <div className={styles.head}>
      <span className={styles.titleGroup}>
        <StatusIcon status={job.status} />
        <span className={styles.title}>{job.label}</span>
      </span>
      {widgetControls ??
        (!isRunning(job) ? (
          <IconButton
            label="Dismiss"
            onClick={() => {
              if (!wasDragged()) dismissUploadJob(job.id);
            }}
          >
            <X size={14} />
          </IconButton>
        ) : null)}
    </div>
    <span
      className={cn(
        styles.status,
        job.status === 'error' && styles.error,
        job.status === 'cancelled' && styles.cancelled,
      )}
    >
      <Upload size={13} className={styles.statusIcon} aria-hidden />
      {statusText(job)}
    </span>
    {job.status !== 'error' && job.status !== 'cancelled' ? (
      <ProgressBar value={percentFor(job)} tone="auto" />
    ) : null}
    <JobActions job={job} wasDragged={wasDragged} />
  </div>
);

const MinimizedBubble = ({
  jobs,
  onMouseDown,
  wasDragged,
  onExpand,
}: {
  readonly jobs: readonly UploadJob[];
  readonly onMouseDown: (event: ReactMouseEvent) => void;
  readonly wasDragged: () => boolean;
  readonly onExpand: () => void;
}): ReactElement => {
  const activeCount = jobs.filter(isRunning).length;
  const hasError = jobs.some((job) => job.status === 'error');

  const label =
    activeCount > 0 ? `${String(activeCount)} files uploading — expand` : 'Show uploads';

  return (
    <button
      type="button"
      className={styles.bubble}
      aria-label={label}
      onMouseDown={onMouseDown}
      onClick={() => {
        if (!wasDragged()) onExpand();
      }}
    >
      {activeCount > 0 ? (
        <Loader2 size={18} className={styles.spin} aria-hidden />
      ) : hasError ? (
        <AlertCircle size={18} className={styles.error} aria-hidden />
      ) : (
        <Upload size={18} className={styles.done} aria-hidden />
      )}
      {activeCount > 0 ? <span className={styles.bubbleBadge}>{activeCount}</span> : null}
    </button>
  );
};

/** Minimize the widget to a bubble, or close it (uploads keep running either way). */
const WidgetControls = ({
  wasDragged,
  onMinimize,
}: {
  readonly wasDragged: () => boolean;
  readonly onMinimize: () => void;
}): ReactElement => (
  <span className={styles.controls}>
    <IconButton
      label="Minimize"
      onClick={() => {
        if (!wasDragged()) onMinimize();
      }}
    >
      <ChevronDown size={14} />
    </IconButton>
    <IconButton
      label="Close"
      onClick={() => {
        if (!wasDragged()) dismissAllUploadJobs();
      }}
    >
      <X size={14} />
    </IconButton>
  </span>
);

/**
 * Floating, app-wide upload tracker — mounted once in `AppLayout` so it stays visible no matter
 * which route the user navigates to while a content-upload job (started from the Upload wizard)
 * is still running in the background. Reads `useUploadQueueStore`, written by `useUploadContent`.
 */
export const UploadProgressWidget = (): ReactElement | null => {
  const jobs = useUploadQueueStore((state) => state.jobs);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { position, isDragging, onHandleMouseDown, wasDragged } =
    useDraggablePosition(wrapRef);
  const [isMinimized, setIsMinimized] = useState(false);

  if (jobs.length === 0) {
    return null;
  }

  const positionStyle: CSSProperties | undefined =
    position === null
      ? undefined
      : { left: position.x, top: position.y, right: 'auto', bottom: 'auto' };

  if (isMinimized) {
    return (
      <div
        ref={wrapRef}
        className={cn(styles.wrap, isDragging && styles.dragging)}
        style={positionStyle}
      >
        <MinimizedBubble
          jobs={jobs}
          onMouseDown={onHandleMouseDown}
          wasDragged={wasDragged}
          onExpand={() => {
            setIsMinimized(false);
          }}
        />
      </div>
    );
  }

  const controls = (
    <WidgetControls
      wasDragged={wasDragged}
      onMinimize={() => {
        setIsMinimized(true);
      }}
    />
  );
  const [onlyJob] = jobs;

  return (
    <div
      ref={wrapRef}
      className={cn(styles.wrap, isDragging && styles.dragging)}
      style={positionStyle}
      onMouseDown={onHandleMouseDown}
    >
      {jobs.length === 1 && onlyJob !== undefined ? (
        <JobCard job={onlyJob} wasDragged={wasDragged} widgetControls={controls} />
      ) : (
        <>
          <div className={styles.handleRow}>{controls}</div>
          <div className={styles.cardsList}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} wasDragged={wasDragged} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
