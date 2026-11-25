import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddWidgetModal } from './AddWidgetModal';
import { useWidgetCatalog } from '../use-dashboard';
import type { WidgetCatalogItem } from '../../domain';

vi.mock('../use-dashboard', () => ({
  useWidgetCatalog: vi.fn(),
}));

const MOCK_CATALOG_ITEMS: readonly WidgetCatalogItem[] = [
  {
    key: 'courses.overview',
    category: 'Courses',
    displayName: 'Course Completion Rate',
    kind: 'series',
    defaultWidth: 6,
    defaultHeight: 3,
    dataEndpoint: null,
    requiredPermissions: [],
    configSchema: [],
  },
  {
    key: 'courses.active',
    category: 'Courses',
    displayName: 'Active Enrollments',
    kind: 'kpi',
    defaultWidth: 3,
    defaultHeight: 2,
    dataEndpoint: null,
    requiredPermissions: [],
    configSchema: [],
  },
  {
    key: 'quizzes.scores',
    category: 'Assessments',
    displayName: 'Average Quiz Scores',
    kind: 'series',
    defaultWidth: 6,
    defaultHeight: 3,
    dataEndpoint: null,
    requiredPermissions: [],
    configSchema: [],
  },
];

describe('<AddWidgetModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when catalog query is pending', () => {
    vi.mocked(useWidgetCatalog).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useWidgetCatalog>);

    render(
      <AddWidgetModal
        open={true}
        onOpenChange={vi.fn()}
        activeKeys={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('status', { name: /loading widget catalog/i }),
    ).toBeInTheDocument();
  });

  it('renders error alert when catalog query fails', () => {
    vi.mocked(useWidgetCatalog).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Network timeout'),
    } as unknown as ReturnType<typeof useWidgetCatalog>);

    render(
      <AddWidgetModal
        open={true}
        onOpenChange={vi.fn()}
        activeKeys={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('Could not load widget catalog')).toBeInTheDocument();
    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('renders empty state when catalog is empty', () => {
    vi.mocked(useWidgetCatalog).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useWidgetCatalog>);

    render(
      <AddWidgetModal
        open={true}
        onOpenChange={vi.fn()}
        activeKeys={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('No widgets available')).toBeInTheDocument();
  });

  it('renders catalog items and allows selecting a widget to configure and place', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    const handleOpenChange = vi.fn();

    vi.mocked(useWidgetCatalog).mockReturnValue({
      data: MOCK_CATALOG_ITEMS,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useWidgetCatalog>);

    render(
      <AddWidgetModal
        open={true}
        onOpenChange={handleOpenChange}
        activeKeys={[]}
        onAdd={handleAdd}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('Course Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Active Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Average Quiz Scores')).toBeInTheDocument();

    // Click to select
    await user.click(screen.getByText('Course Completion Rate'));

    // Step 2 should be active
    expect(screen.getByText('Configure — Course Completion Rate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place on grid/i })).toBeInTheDocument();

    // Click Place on grid
    await user.click(screen.getByRole('button', { name: /place on grid/i }));

    expect(handleAdd).toHaveBeenCalledWith(MOCK_CATALOG_ITEMS[0], {}, 6, 3);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onRemove when clicking an already added widget', async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();

    vi.mocked(useWidgetCatalog).mockReturnValue({
      data: MOCK_CATALOG_ITEMS,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useWidgetCatalog>);

    render(
      <AddWidgetModal
        open={true}
        onOpenChange={vi.fn()}
        activeKeys={['courses.overview']}
        onAdd={vi.fn()}
        onRemove={handleRemove}
      />,
    );

    // Clicking added item invokes onRemove
    await user.click(screen.getByText('Course Completion Rate'));
    expect(handleRemove).toHaveBeenCalledWith('courses.overview');
  });
});
