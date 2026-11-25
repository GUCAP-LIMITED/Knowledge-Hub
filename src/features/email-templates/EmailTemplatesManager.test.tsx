import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@shared/ui';
import { ok } from '@core/result';
import {
  type EmailTemplate,
  EmailTemplateKind,
  type EmailTemplateGateway,
  type CreateEmailTemplateInput,
  type UpdateEmailTemplateInput,
} from './types';
import { EmailTemplatesManager } from './EmailTemplatesManager';
import { EmailTemplatesModuleProvider } from './EmailTemplatesModuleProvider';

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Welcome Email',
    body: 'Hello {{UserName}}, welcome to the platform!',
    kind: EmailTemplateKind.Email,
    isDefault: true,
    isActive: true,
    ownerUserId: null,
    creationTime: '2026-01-01T00:00:00Z',
    lastModificationTime: null,
  },
  {
    id: 'tpl-2',
    name: 'Course Reminder SMS',
    body: 'Hi {{UserName}}, remember to complete {{CourseTitle}}.',
    kind: EmailTemplateKind.Sms,
    isDefault: false,
    isActive: false,
    ownerUserId: 'user-123',
    creationTime: '2026-01-02T00:00:00Z',
    lastModificationTime: null,
  },
];

const createFakeGateway = (
  templates: EmailTemplate[] = [...MOCK_TEMPLATES],
): EmailTemplateGateway => {
  let list = [...templates];
  return {
    getList: vi.fn(() => Promise.resolve(ok(list))),
    get: vi.fn((id: string) => {
      const found = list.find((t) => t.id === id);
      if (!found) {
        throw new Error('Template not found');
      }
      return Promise.resolve(ok(found));
    }),
    create: vi.fn((input: CreateEmailTemplateInput) => {
      const created: EmailTemplate = {
        id: `tpl-${String(Date.now())}`,
        name: input.name,
        body: input.body,
        kind: input.kind,
        isDefault: false,
        isActive: input.isActive ?? true,
        ownerUserId: 'current-user',
        creationTime: new Date().toISOString(),
        lastModificationTime: null,
      };
      list.push(created);
      return Promise.resolve(ok(created));
    }),
    update: vi.fn((id: string, input: UpdateEmailTemplateInput) => {
      const index = list.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }
      const existing = list[index]!;
      const updated: EmailTemplate = {
        ...existing,
        name: input.name,
        body: input.body,
        kind: input.kind,
        isActive: input.isActive,
        lastModificationTime: new Date().toISOString(),
      };
      list[index] = updated;
      return Promise.resolve(ok(updated));
    }),
    delete: vi.fn((id: string) => {
      list = list.filter((t) => t.id !== id);
      return Promise.resolve(ok(undefined));
    }),
    setActive: vi.fn((id: string, isActive: boolean) => {
      const index = list.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }
      const existing = list[index]!;
      const updated: EmailTemplate = {
        ...existing,
        isActive,
        lastModificationTime: new Date().toISOString(),
      };
      list[index] = updated;
      return Promise.resolve(ok(updated));
    }),
  };
};

const renderWithProviders = (gateway: EmailTemplateGateway): RenderResult => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const module = {
    gateway,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <EmailTemplatesModuleProvider module={module}>
          <EmailTemplatesManager />
        </EmailTemplatesModuleProvider>
      </ToastProvider>
    </QueryClientProvider>,
  );
};

describe('<EmailTemplatesManager />', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders templates list loaded from gateway', async () => {
    const gateway = createFakeGateway();
    renderWithProviders(gateway);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('Course Reminder SMS')).toBeInTheDocument();
    });

    expect(screen.getByText('System Default')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('filters templates when search query is typed', async () => {
    const gateway = createFakeGateway();
    renderWithProviders(gateway);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'Reminder');

    expect(screen.queryByText('Welcome Email')).not.toBeInTheDocument();
    expect(screen.getByText('Course Reminder SMS')).toBeInTheDocument();
  });

  it('toggles template active state via setActive', async () => {
    const gateway = createFakeGateway();
    renderWithProviders(gateway);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const switchToggle = screen.getByLabelText('Toggle active for Welcome Email');
    await user.click(switchToggle);

    await waitFor(() => {
      expect(gateway.setActive).toHaveBeenCalledWith('tpl-1', false);
    });
  });

  it('opens create modal when clicking Create Template', async () => {
    const gateway = createFakeGateway();
    renderWithProviders(gateway);

    await waitFor(() => {
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Create Template'));

    expect(
      screen.getByText('Define a reusable communication template with merge tokens.'),
    ).toBeInTheDocument();
  });

  it('opens edit modal when clicking edit button', async () => {
    const gateway = createFakeGateway();
    renderWithProviders(gateway);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('Edit template');
    await user.click(editButtons[0]!);

    expect(
      screen.getByText('Update template message and active status.'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Welcome Email')).toBeInTheDocument();
  });
});
