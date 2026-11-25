import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useUploadQueueStore, type UploadJob } from '../store';
import { UploadProgressWidget } from './UploadProgressWidget';
import * as runner from './upload-job-runner';

vi.mock('./upload-job-runner', () => ({
  cancelUploadJob: vi.fn(),
  retryUploadJob: vi.fn(),
  dismissUploadJob: vi.fn(),
  dismissAllUploadJobs: vi.fn(),
}));

const job = (over: Partial<UploadJob> = {}): UploadJob => ({
  id: 'job-1',
  label: 'Master UAPP',
  totalFiles: 3,
  completedFiles: 1,
  status: 'uploading',
  errorMessage: null,
  ...over,
});

const setJobs = (...jobs: readonly UploadJob[]): void => {
  useUploadQueueStore.setState({ jobs });
};

describe('<UploadProgressWidget />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setJobs();
  });

  it('renders nothing when there are no jobs', () => {
    const { container } = render(<UploadProgressWidget />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps minimize and close inside the card when there is a single job', () => {
    setJobs(job());
    render(<UploadProgressWidget />);

    const card = screen.getByRole('status');
    expect(within(card).getByRole('button', { name: 'Minimize' })).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('puts minimize and close on a layer above the cards when there are several jobs', () => {
    setJobs(job(), job({ id: 'job-2', label: 'Another upload' }));
    render(<UploadProgressWidget />);

    const cards = screen.getAllByRole('status');
    expect(cards).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Minimize' })).toHaveLength(1);
    for (const card of cards) {
      expect(
        within(card).queryByRole('button', { name: 'Minimize' }),
      ).not.toBeInTheDocument();
      expect(
        within(card).queryByRole('button', { name: 'Close' }),
      ).not.toBeInTheDocument();
    }
  });

  it('cancels a running job from its card', () => {
    setJobs(job());
    render(<UploadProgressWidget />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel upload/ }));

    expect(runner.cancelUploadJob).toHaveBeenCalledWith('job-1');
  });

  it('shows the cancelling state without any action buttons', () => {
    setJobs(job({ status: 'cancelling' }));
    render(<UploadProgressWidget />);

    expect(screen.getByText('Cancelling…')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Cancel upload|Retry/ }),
    ).not.toBeInTheDocument();
  });

  it('offers retry on a failed job and on a cancelled one', () => {
    setJobs(job({ status: 'error', errorMessage: 'Upload failed (500).' }));
    const { rerender } = render(<UploadProgressWidget />);

    expect(screen.getByText('Upload failed (500).')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Retry/ }));
    expect(runner.retryUploadJob).toHaveBeenCalledWith('job-1');

    setJobs(job({ status: 'cancelled' }));
    rerender(<UploadProgressWidget />);
    expect(screen.getByText('Upload cancelled.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
  });

  it('dismisses a finished card in a multi-job layout', () => {
    setJobs(job({ status: 'done' }), job({ id: 'job-2', label: 'Other' }));
    render(<UploadProgressWidget />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(runner.dismissUploadJob).toHaveBeenCalledWith('job-1');
  });
});
