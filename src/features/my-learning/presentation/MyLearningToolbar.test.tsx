import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { MyLearningStatusOption } from '../domain/types';
import { MyLearningToolbar, type MyLearningToolbarProps } from './MyLearningToolbar';
import { buildDynamicStatusOptions } from './my-learning-query-utils';

const mockStatuses: readonly MyLearningStatusOption[] = [
  { value: 0, name: 'NotStarted', label: 'Not Started' },
  { value: 1, name: 'InProgress', label: 'In Progress' },
  { value: 2, name: 'Completed', label: 'Completed' },
  { value: 3, name: 'Overdue', label: 'Overdue' },
  { value: 4, name: 'Paused', label: 'Paused' },
];

describe('buildDynamicStatusOptions', () => {
  it('includes Overdue when assigned tab is active and follows strict backend order', () => {
    const options = buildDynamicStatusOptions(mockStatuses, true);

    expect(options).toEqual([
      { value: 'all', label: 'All Statuses' },
      { value: '0', label: 'Not Started' },
      { value: '1', label: 'In Progress' },
      { value: '2', label: 'Completed' },
      { value: '3', label: 'Overdue' },
      { value: '4', label: 'Paused' },
    ]);
  });

  it('omits Overdue when assigned tab is not active', () => {
    const options = buildDynamicStatusOptions(mockStatuses, false);

    expect(options).toEqual([
      { value: 'all', label: 'All Statuses' },
      { value: '0', label: 'Not Started' },
      { value: '1', label: 'In Progress' },
      { value: '2', label: 'Completed' },
      { value: '4', label: 'Paused' },
    ]);
  });
});

describe('<MyLearningToolbar />', () => {
  const defaultProps: MyLearningToolbarProps = {
    search: '',
    onSearchChange: vi.fn(),
    origin: 'all',
    onOriginChange: vi.fn(),
    assignedScope: 'all',
    onAssignedScopeChange: vi.fn(),
    contentType: 'all',
    onContentTypeChange: vi.fn(),
    status: 'all',
    onStatusChange: vi.fn(),
    statuses: mockStatuses,
    sorting: 'EnrolledOrAssignedAt DESC',
    onSortingChange: vi.fn(),
    stats: undefined,
    onClearAll: vi.fn(),
  };

  it('renders toolbar with search and filter controls', () => {
    render(<MyLearningToolbar {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Search your courses, tutorials, resources…'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Content Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
  });
});
