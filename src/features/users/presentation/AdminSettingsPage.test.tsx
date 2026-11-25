import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminSettingsPage } from './AdminSettingsPage';

vi.mock('@features/content-types', () => ({
  ContentTypesManager: () => (
    <div data-testid="content-types-panel">ContentTypesManager</div>
  ),
}));

vi.mock('@features/certificate-templates', () => ({
  CertificateTemplatesManager: () => (
    <div data-testid="certificates-panel">CertificateTemplatesManager</div>
  ),
}));

vi.mock('@features/permissions', () => ({
  PermissionsManager: () => <div data-testid="permissions-panel">PermissionsManager</div>,
}));

vi.mock('@features/dashboard', () => ({
  ConfigureDashboardPage: ({ hideHeader }: { readonly hideHeader?: boolean }) => (
    <div data-testid="dashboards-panel" data-hide-header={hideHeader}>
      ConfigureDashboardPage
    </div>
  ),
}));

vi.mock('./SettingsToggles', () => ({
  SettingsToggles: () => <div data-testid="settings-toggles">SettingsToggles</div>,
}));

vi.mock('./UsersSection', () => ({
  UsersSection: () => <div data-testid="users-section">UsersSection</div>,
}));

vi.mock('@features/email-templates', () => ({
  EmailTemplatesManager: () => (
    <div data-testid="email-templates-panel">EmailTemplatesManager</div>
  ),
}));

describe('<AdminSettingsPage />', () => {
  it('renders platform settings when section is platform', () => {
    render(
      <MemoryRouter initialEntries={['/settings/platform']}>
        <Routes>
          <Route path="/settings/:section" element={<AdminSettingsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Platform Settings')).toBeInTheDocument();
    expect(screen.getByTestId('settings-toggles')).toBeInTheDocument();
  });

  it('renders dashboards panel when section is dashboards', () => {
    render(
      <MemoryRouter initialEntries={['/settings/dashboards']}>
        <Routes>
          <Route path="/settings/:section" element={<AdminSettingsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Configure Dashboards')).toBeInTheDocument();
    const dashboardsPanel = screen.getByTestId('dashboards-panel');
    expect(dashboardsPanel).toBeInTheDocument();
    expect(dashboardsPanel).toHaveAttribute('data-hide-header', 'true');
  });

  it('renders email templates panel when section is email-templates', () => {
    render(
      <MemoryRouter initialEntries={['/settings/email-templates']}>
        <Routes>
          <Route path="/settings/:section" element={<AdminSettingsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Email Templates')).toBeInTheDocument();
    expect(screen.getByTestId('email-templates-panel')).toBeInTheDocument();
  });

  it('redirects to /settings/platform when section is invalid', () => {
    render(
      <MemoryRouter initialEntries={['/settings/invalid-section']}>
        <Routes>
          <Route path="/settings/:section" element={<AdminSettingsPage />} />
          <Route path="/settings/platform" element={<div>Fallback Platform</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Fallback Platform')).toBeInTheDocument();
  });
});
