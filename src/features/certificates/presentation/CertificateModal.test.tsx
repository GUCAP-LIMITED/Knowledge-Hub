import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ok, err } from '@core/result';
import type { Clock } from '@core/time';
import {
  GetCertificateUseCase,
  ListCertificatesUseCase,
  GetCertificateStatisticsOverviewUseCase,
} from '../application';
import { FakeCertificateGateway, buildCertificate, silentLogger } from '@testing';
import { CertificateModal } from './CertificateModal';
import { CertificatesModuleProvider } from './CertificatesModuleProvider';
import type { CertificatesModule } from '../certificates-module';

const createTestModule = (fakeGateway: FakeCertificateGateway): CertificatesModule => {
  const clock: Clock = {
    now: () => new Date('2026-03-01T12:00:00.000Z'),
  };
  const logger = silentLogger();

  return {
    listCertificates: new ListCertificatesUseCase({
      certificateGateway: fakeGateway,
      logger,
    }),
    getCertificate: new GetCertificateUseCase({
      certificateGateway: fakeGateway,
      logger,
    }),
    getCertificateStatisticsOverview: new GetCertificateStatisticsOverviewUseCase({
      certificateGateway: fakeGateway,
      logger,
    }),
    clock,
  };
};

const renderWithProviders = (
  ui: React.ReactElement,
  fakeGateway = new FakeCertificateGateway(),
): RenderResult => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const module = createTestModule(fakeGateway);

  return render(
    <QueryClientProvider client={queryClient}>
      <CertificatesModuleProvider module={module}>{ui}</CertificatesModuleProvider>
    </QueryClientProvider>,
  );
};

describe('<CertificateModal />', () => {
  it('renders pre-resolved Certificate entity directly without network query', () => {
    const cert = buildCertificate({
      userName: 'Alice Cooper',
      courseName: 'System Architecture Fundamentals',
    });
    const handleClose = vi.fn();

    renderWithProviders(<CertificateModal certificate={cert} onClose={handleClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
    expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
    expect(screen.getByText(/System Architecture Fundamentals/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy URL/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
  });

  it('renders loading skeleton while fetching by certificateId', () => {
    const fakeGateway = new FakeCertificateGateway();
    fakeGateway.getById = () => new Promise<never>(() => undefined);

    renderWithProviders(
      <CertificateModal certificateId="cert-pending-123" onClose={vi.fn()} />,
      fakeGateway,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
  });

  it('fetches and renders certificate when certificateId resolves', async () => {
    const fakeGateway = new FakeCertificateGateway();
    fakeGateway.getByIdResult = ok(
      buildCertificate({
        id: 'cert-resolved-1',
        userName: 'David Gilmour',
        courseName: 'Progressive Web Apps Mastery',
      }),
    );

    renderWithProviders(
      <CertificateModal certificateId="cert-resolved-1" onClose={vi.fn()} />,
      fakeGateway,
    );

    await waitFor(() => {
      expect(screen.getByText('David Gilmour')).toBeInTheDocument();
      expect(screen.getByText(/Progressive Web Apps Mastery/)).toBeInTheDocument();
    });
  });

  it('renders error state with retry button when certificateId fetch fails', async () => {
    const fakeGateway = new FakeCertificateGateway();
    fakeGateway.getById = () =>
      Promise.resolve(
        err({
          type: 'not_found',
          message: 'Certificate was not found',
        } as never),
      );

    renderWithProviders(
      <CertificateModal certificateId="cert-error-99" onClose={vi.fn()} />,
      fakeGateway,
    );

    await waitFor(() => {
      expect(screen.getByText('Could not load certificate')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });
  });

  it('invokes onClose when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const cert = buildCertificate();

    renderWithProviders(<CertificateModal certificate={cert} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
