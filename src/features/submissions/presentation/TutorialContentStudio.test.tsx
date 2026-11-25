import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { MediaDraftInput } from '@features/content';
import { TutorialContentStudio } from './TutorialContentStudio';

const mockUpdateMedia = vi.fn();
const mockUpdateDetails = vi.fn();

const mockVideos: MediaDraftInput[] = [
  {
    id: 'vid-1',
    azureBlobName: '',
    originalFileName: 'Sample Video 1.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 13316915, // ~12.7 MB
    kind: 1,
    slot: 1,
    displayOrder: 0,
    durationSeconds: 0,
  },
  {
    id: 'vid-2',
    azureBlobName: '',
    originalFileName: 'Sample Video 2.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 13316915,
    kind: 1,
    slot: 1,
    displayOrder: 1,
    durationSeconds: 14493, // 04:01:33
  },
  {
    id: 'vid-3',
    azureBlobName: '',
    originalFileName: 'Sample Video 3.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 13316915,
    kind: 1,
    slot: 1,
    displayOrder: 2,
    durationSeconds: 750, // 12:30
  },
];

vi.mock('@features/playback', () => ({
  PlaybackMediaViewer: () => <div data-testid="playback-media-viewer">Viewer</div>,
}));

vi.mock(
  '@features/content',
  async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useGetMediaReadSas: () => ({ data: null, isLoading: false }),
    };
  },
);

vi.mock('@features/content/presentation/use-content-module', () => ({
  useContentModule: () => ({
    gateway: {
      requestUpload: vi.fn(),
      uploadToBlob: vi.fn(),
    },
  }),
}));

vi.mock('./use-draft-editor', () => ({
  useDraftEditor: () => ({
    contentId: 'tut-1',
    draftState: {
      details: {
        title: 'Tutorial Title',
        durationSeconds: 15243,
      },
      media: mockVideos,
    },
    updateMedia: mockUpdateMedia,
    updateDetails: mockUpdateDetails,
  }),
}));

describe('TutorialContentStudio - Video Duration Display & Inline Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays duration for each video part in playlist (--:-- when 0, and 04:01:33 for hours/min/sec)', () => {
    render(<TutorialContentStudio />);

    // Video 1 (0 seconds) should show --:--
    expect(screen.getByText(/Published · 12.7 MB · --:--/)).toBeInTheDocument();

    // Video 2 (14493 seconds = 4h 1m 33s) should show 04:01:33
    expect(screen.getByText(/Published · 12.7 MB · 04:01:33/)).toBeInTheDocument();

    // Video 3 (750 seconds = 12m 30s) should show 12:30
    expect(screen.getByText(/Published · 12.7 MB · 12:30/)).toBeInTheDocument();
  });

  it('renders edit pencil icons for each video part in edit mode', () => {
    render(<TutorialContentStudio />);

    const editButtons = screen.getAllByRole('button', {
      name: /Edit duration for part/i,
    });
    expect(editButtons).toHaveLength(3);
  });

  it('does not render edit pencil icons in readOnly mode', () => {
    render(<TutorialContentStudio readOnly />);

    const editButtons = screen.queryAllByRole('button', {
      name: /Edit duration for part/i,
    });
    expect(editButtons).toHaveLength(0);
  });

  it('clicking pencil opens inline duration input with save and cancel buttons', () => {
    render(<TutorialContentStudio />);

    const editPart2Btn = screen.getByRole('button', { name: 'Edit duration for part 2' });
    fireEvent.click(editPart2Btn);

    const input = screen.getByLabelText('Duration for part 2');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('04:01:33');

    expect(
      screen.getByRole('button', { name: 'Save duration for part 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel editing duration for part 2' }),
    ).toBeInTheDocument();
  });

  it('canceling inline duration edit reverts without calling updateMedia', () => {
    render(<TutorialContentStudio />);

    const editPart1Btn = screen.getByRole('button', { name: 'Edit duration for part 1' });
    fireEvent.click(editPart1Btn);

    const input = screen.getByLabelText('Duration for part 1');
    fireEvent.change(input, { target: { value: '10:00' } });

    const cancelBtn = screen.getByRole('button', {
      name: 'Cancel editing duration for part 1',
    });
    fireEvent.click(cancelBtn);

    expect(mockUpdateMedia).not.toHaveBeenCalled();
    expect(mockUpdateDetails).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Duration for part 1')).not.toBeInTheDocument();
  });

  it('entering valid duration and clicking save updates video part and recalculates total duration', () => {
    render(<TutorialContentStudio />);

    const editPart1Btn = screen.getByRole('button', { name: 'Edit duration for part 1' });
    fireEvent.click(editPart1Btn);

    const input = screen.getByLabelText('Duration for part 1');
    // Change Part 1 from 0 to 10:00 (600 seconds)
    fireEvent.change(input, { target: { value: '10:00' } });

    const saveBtn = screen.getByRole('button', { name: 'Save duration for part 1' });
    fireEvent.click(saveBtn);

    expect(mockUpdateMedia).toHaveBeenCalledTimes(1);
    const updatedMediaArg = mockUpdateMedia.mock.calls[0]?.[0] as MediaDraftInput[];
    expect(updatedMediaArg[0]?.durationSeconds).toBe(600);

    // Total Duration recalculated: 600 + 14493 + 750 = 15843
    expect(mockUpdateDetails).toHaveBeenCalledWith({ durationSeconds: 15843 });
  });

  it('entering hour:minute:second format (e.g. 01:30:00) parses and saves correctly', () => {
    render(<TutorialContentStudio />);

    const editPart1Btn = screen.getByRole('button', { name: 'Edit duration for part 1' });
    fireEvent.click(editPart1Btn);

    const input = screen.getByLabelText('Duration for part 1');
    fireEvent.change(input, { target: { value: '01:30:00' } });

    const saveBtn = screen.getByRole('button', { name: 'Save duration for part 1' });
    fireEvent.click(saveBtn);

    expect(mockUpdateMedia).toHaveBeenCalledTimes(1);
    const updatedMediaArg = mockUpdateMedia.mock.calls[0]?.[0] as MediaDraftInput[];
    // 1h 30m = 5400 seconds
    expect(updatedMediaArg[0]?.durationSeconds).toBe(5400);
  });

  it('entering invalid duration format prevents saving and highlights error border', () => {
    render(<TutorialContentStudio />);

    const editPart1Btn = screen.getByRole('button', { name: 'Edit duration for part 1' });
    fireEvent.click(editPart1Btn);

    const input = screen.getByLabelText('Duration for part 1');
    fireEvent.change(input, { target: { value: 'invalid_time' } });

    const saveBtn = screen.getByRole('button', { name: 'Save duration for part 1' });
    fireEvent.click(saveBtn);

    expect(mockUpdateMedia).not.toHaveBeenCalled();
    expect(mockUpdateDetails).not.toHaveBeenCalled();

    // Input remains open with error styling
    expect(screen.getByLabelText('Duration for part 1')).toBeInTheDocument();
    expect(input.style.border).toContain('var(--color-danger');
  });
});
