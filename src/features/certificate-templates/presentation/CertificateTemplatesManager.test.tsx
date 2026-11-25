import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@shared/ui';
import { silentLogger } from '@testing/fakes/silent-logger';
import { err, ok } from '@core/result';
import {
  GetCertificateTemplateUseCase,
  UpsertCertificateTemplateUseCase,
} from '../application';
import {
  CertificateTemplateLoadFailedError,
  type CertificateTemplateGateway,
} from '../domain';
import { useCertificateTemplateStore } from '../store/certificate-template-store';
import { CertificateTemplatesManager } from './CertificateTemplatesManager';
import { CertificateTemplatesModuleProvider } from './CertificateTemplatesModuleProvider';

const INITIAL_DESIGNS = useCertificateTemplateStore.getState().designs;
const INITIAL_HYDRATED_KINDS = useCertificateTemplateStore.getState().hydratedKinds;
const INITIAL_SAVED_BACKGROUND =
  useCertificateTemplateStore.getState().savedBackgroundImage;

/** A fixed, origin-anchored canvas rect so pointer-drag math is deterministic in jsdom. */
const CANVAS_RECT = { left: 0, top: 0, width: 700, height: 495 } as DOMRect;

/** A real pre-redesign template body, as returned by the backend for an existing certificate. */
const LEGACY_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>course certificate template</title></head>
<body>
<div class="frame completion" style="--art-accent: #045d5e; background-image: url(/certificates/course/background.png);">
<div class="body">
  <h2 class="heading">
    <span class="headingMain">Certificate</span>
    <span class="headingSub">Of Completion</span>
  </h2>
  <p class="kicker">This is to certify that</p>
  <p class="name">{{userName}}</p>
  <p class="bodyText">for successfully completing {{courseName}}.</p>
</div>
</div>
</body>
</html>`;

interface RenderManagerOptions {
  /** Defaults to `ok(null)` — "nothing saved yet" — so hydration never fires and the default
   * in-memory design stays authoritative for tests that don't care about the load flow. */
  readonly get?: CertificateTemplateGateway['get'];
}

const renderManager = (
  options: RenderManagerOptions = {},
): { upsert: ReturnType<typeof vi.fn> } => {
  const upsert = vi.fn(() =>
    Promise.resolve(
      ok({
        kind: 'course' as const,
        content: '<html></html>',
        lastModificationTime: null,
      }),
    ),
  );
  const get = options.get ?? vi.fn(() => Promise.resolve(ok(null)));
  const gateway: CertificateTemplateGateway = { upsert, get };
  const module = {
    upsertCertificateTemplate: new UpsertCertificateTemplateUseCase({
      certificateTemplateGateway: gateway,
      logger: silentLogger(),
    }),
    getCertificateTemplate: new GetCertificateTemplateUseCase({
      certificateTemplateGateway: gateway,
      logger: silentLogger(),
    }),
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CertificateTemplatesModuleProvider module={module}>
          <CertificateTemplatesManager />
        </CertificateTemplatesModuleProvider>
      </ToastProvider>
    </QueryClientProvider>,
  );

  return { upsert };
};

/** Finds the draggable canvas wrapper for an overlay element by its visible sample text. */
const canvasElementFor = (text: string): HTMLElement => {
  const node = screen.getByText(text).closest('[role="button"]');
  if (node === null) {
    throw new Error(`No draggable canvas element found for "${text}"`);
  }
  return node as HTMLElement;
};

/** The HTML-source tab's textarea, narrowed so `.value` is readable without a type assertion. */
const htmlSourceTextbox = (): HTMLTextAreaElement => {
  const element = screen.getByLabelText('Certificate HTML');
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('Expected the "Certificate HTML" field to be a textarea');
  }
  return element;
};

describe('<CertificateTemplatesManager />', () => {
  beforeEach(() => {
    useCertificateTemplateStore.setState({
      designs: INITIAL_DESIGNS,
      hydratedKinds: INITIAL_HYDRATED_KINDS,
      savedBackgroundImage: INITIAL_SAVED_BACKGROUND,
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(CANVAS_RECT);
  });

  it('renders the canvas with the sample name and the course name resolved inside body copy', () => {
    renderManager();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText(/Getting Started with UAPP Portal/)).toBeInTheDocument();
  });

  it('renders the admin-authored heading and kicker for the active kind', () => {
    renderManager();
    const { heading, kicker } = useCertificateTemplateStore.getState().designs.course;
    expect(screen.getByText(heading)).toBeInTheDocument();
    expect(screen.getByText(kicker)).toBeInTheDocument();
  });

  it('starts with nothing selected — no element toolbar shown', () => {
    renderManager();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('clicking outside the editor deselects the current element', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    expect(screen.getByRole('toolbar', { name: 'Element style' })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('clicking inside the style toolbar does not deselect the element', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    const toolbar = screen.getByRole('toolbar', { name: 'Element style' });
    fireEvent.pointerDown(toolbar);

    expect(screen.getByRole('toolbar', { name: 'Element style' })).toBeInTheDocument();
  });

  it('selecting a static element shows its toolbar and an edit-in-place hint', async () => {
    renderManager();
    const user = userEvent.setup();
    const { kicker } = useCertificateTemplateStore.getState().designs.course;

    await user.click(canvasElementFor(kicker));
    expect(screen.getByText('Kicker line')).toBeInTheDocument();
    expect(
      screen.getByText('Double-click it on the canvas to edit the text.'),
    ).toBeInTheDocument();
  });

  it("pressing Space while editing is not hijacked by the canvas wrapper's keyboard-select handler", () => {
    renderManager();
    const { kicker } = useCertificateTemplateStore.getState().designs.course;

    fireEvent.doubleClick(canvasElementFor(kicker));
    const editable = screen.getByRole('textbox');
    // fireEvent.* returns false if preventDefault() was called anywhere in the dispatch — the
    // canvas wrapper's Space/Enter "activate like a button" handler used to do exactly that.
    const notPrevented = fireEvent.keyDown(editable, { key: ' ' });

    expect(notPrevented).toBe(true);
  });

  it('double-clicking a static element enters in-place editing; typing and blurring commits it', () => {
    renderManager();
    const { kicker } = useCertificateTemplateStore.getState().designs.course;

    fireEvent.doubleClick(canvasElementFor(kicker));

    const editable = screen.getByRole('textbox');
    expect(editable).toHaveTextContent(kicker);

    editable.textContent = 'Awarded to';
    fireEvent.blur(editable);

    expect(useCertificateTemplateStore.getState().designs.course.kicker).toBe(
      'Awarded to',
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('pressing Escape while editing cancels without saving', () => {
    renderManager();
    const { kicker } = useCertificateTemplateStore.getState().designs.course;

    fireEvent.doubleClick(canvasElementFor(kicker));
    const editable = screen.getByRole('textbox');
    editable.textContent = 'Should not be saved';
    fireEvent.keyDown(editable, { key: 'Escape' });

    expect(useCertificateTemplateStore.getState().designs.course.kicker).toBe(kicker);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not offer in-place editing for the dynamic name element', () => {
    renderManager();
    fireEvent.doubleClick(canvasElementFor('Alex Morgan'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('selecting a text element shows its style controls, and editing them updates the store', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    expect(screen.getByText('Recipient name')).toBeInTheDocument();

    const fontSizeInput = screen.getByLabelText('Font size (px)');
    await user.clear(fontSizeInput);
    await user.type(fontSizeInput, '22');
    expect(useCertificateTemplateStore.getState().designs.course.nameStyle.fontSize).toBe(
      22,
    );

    const colorInput = screen.getByLabelText('Text colour');
    fireEvent.change(colorInput, { target: { value: '#ff00aa' } });
    expect(useCertificateTemplateStore.getState().designs.course.nameStyle.color).toBe(
      '#ff00aa',
    );
  });

  it('choosing a font weight from the dropdown keeps the element selected and updates the store', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    expect(screen.getByRole('toolbar', { name: 'Element style' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Font weight' }));
    await user.click(screen.getByRole('option', { name: 'Extrabold' }));

    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.fontWeight,
    ).toBe(800);
    // The dropdown option lives in a Radix portal outside the editor's own DOM subtree — picking
    // it must not be mistaken for an outside click that deselects the element.
    expect(screen.getByRole('toolbar', { name: 'Element style' })).toBeInTheDocument();
  });

  it('toggling the underline button flips the style and updates its pressed state', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.underline,
    ).toBe(false);

    const underlineButton = screen.getByRole('button', { name: 'Underline' });
    expect(underlineButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(underlineButton);
    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.underline,
    ).toBe(true);
    expect(underlineButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(underlineButton);
    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.underline,
    ).toBe(false);
  });

  it('toggling the horizontal line button flips the style and updates its pressed state', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.horizontalLine,
    ).toBe(false);

    const horizontalLineButton = screen.getByRole('button', { name: 'Horizontal line' });
    expect(horizontalLineButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(horizontalLineButton);
    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.horizontalLine,
    ).toBe(true);
    expect(horizontalLineButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(horizontalLineButton);
    expect(
      useCertificateTemplateStore.getState().designs.course.nameStyle.horizontalLine,
    ).toBe(false);
  });

  it('the font-size +/- steppers nudge and clamp within range', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(canvasElementFor('Alex Morgan'));
    await user.click(screen.getByRole('button', { name: 'Increase font size' }));
    expect(useCertificateTemplateStore.getState().designs.course.nameStyle.fontSize).toBe(
      41,
    );

    await user.click(screen.getByRole('button', { name: 'Decrease font size' }));
    await user.click(screen.getByRole('button', { name: 'Decrease font size' }));
    expect(useCertificateTemplateStore.getState().designs.course.nameStyle.fontSize).toBe(
      39,
    );
  });

  it('selecting the QR element shows a position/size-only hint, no style controls', () => {
    renderManager();
    const qrHandle = document
      .querySelector('.lucide-qr-code')
      ?.closest('[role="button"]');
    expect(qrHandle).not.toBeNull();
    fireEvent.pointerDown(qrHandle as HTMLElement);

    expect(screen.getByRole('toolbar', { name: 'QR code' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Font size (px)')).not.toBeInTheDocument();
  });

  it('dragging the name element repositions it (updates x/y in the store)', () => {
    renderManager();
    const nameHandle = canvasElementFor('Alex Morgan');

    fireEvent.pointerDown(nameHandle, { clientX: 350, clientY: 227.7 });
    fireEvent.pointerMove(window, { clientX: 140, clientY: 99 });
    fireEvent.pointerUp(window);

    const { nameStyle } = useCertificateTemplateStore.getState().designs.course;
    expect(nameStyle.x).toBeCloseTo(20, 0);
    expect(nameStyle.y).toBeCloseTo(20, 0);
  });

  it('dragging the QR resize handle grows its stored size', async () => {
    renderManager();
    const user = userEvent.setup();
    const qrHandle = document
      .querySelector('.lucide-qr-code')
      ?.closest('[role="button"]');
    await user.click(qrHandle as HTMLElement);

    const resizeHandle = (qrHandle as HTMLElement).querySelector(
      '[aria-hidden="true"]:last-child',
    );
    expect(resizeHandle).not.toBeNull();

    const before = useCertificateTemplateStore.getState().designs.course.qrStyle.size;
    fireEvent.pointerDown(resizeHandle as HTMLElement, { clientX: 616, clientY: 435.6 });
    fireEvent.pointerMove(window, { clientX: 665, clientY: 465 });
    fireEvent.pointerUp(window);

    expect(
      useCertificateTemplateStore.getState().designs.course.qrStyle.size,
    ).toBeGreaterThan(before);
  });

  it('starts from the shipped background, with nothing custom to remove', () => {
    renderManager();

    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      '/certificates/course/background.png',
    );
    expect(screen.getByText('Replace background')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove background' }),
    ).not.toBeInTheDocument();
  });

  it('uploading a background image replaces the shipped one in the store', async () => {
    renderManager();
    const user = userEvent.setup();

    const file = new File(['fake-image-bytes'], 'bg.png', { type: 'image/png' });
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput === null) {
      throw new Error('No file input found');
    }
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(
        useCertificateTemplateStore.getState().designs.course.backgroundImage,
      ).toMatch(/^data:/);
    });
    expect(screen.getByRole('button', { name: 'Remove background' })).toBeInTheDocument();
  });

  it('removing an uploaded background falls back to the shipped one', async () => {
    renderManager();
    const user = userEvent.setup();

    const file = new File(['fake-image-bytes'], 'bg.png', { type: 'image/png' });
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput === null) {
      throw new Error('No file input found');
    }
    await user.upload(fileInput, file);
    await screen.findByRole('button', { name: 'Remove background' });

    await user.click(screen.getByRole('button', { name: 'Remove background' }));

    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      '/certificates/course/background.png',
    );
    expect(
      screen.queryByRole('button', { name: 'Remove background' }),
    ).not.toBeInTheDocument();
    expect(fileInput.value).toBe('');
  });

  it('ignores an older, unmarked background embedded in the saved template', async () => {
    const SAVED_HTML = `<!DOCTYPE html><html><body>
      <div data-element="canvas" style="background-image: url(old-bg.png);">
        <span data-element="heading">Saved heading</span>
      </div>
    </body></html>`;
    const get = vi.fn(() =>
      Promise.resolve(
        ok({ kind: 'course' as const, content: SAVED_HTML, lastModificationTime: null }),
      ),
    );
    renderManager({ get });

    await waitFor(() => {
      expect(useCertificateTemplateStore.getState().designs.course.heading).toBe(
        'Saved heading',
      );
    });
    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      '/certificates/course/background.png',
    );
  });

  it('removing a just-uploaded replacement restores the previously-saved background instead of clearing it', async () => {
    const SAVED_HTML = `<!DOCTYPE html><html><body>
      <div data-element="canvas" data-background="custom" style="background-image: url(saved-bg.png);"></div>
    </body></html>`;
    const get = vi.fn(() =>
      Promise.resolve(
        ok({ kind: 'course' as const, content: SAVED_HTML, lastModificationTime: null }),
      ),
    );
    renderManager({ get });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
        'saved-bg.png',
      );
    });

    const file = new File(['fake-image-bytes'], 'new-bg.png', { type: 'image/png' });
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput === null) {
      throw new Error('No file input found');
    }
    await user.upload(fileInput, file);
    await waitFor(() => {
      expect(
        useCertificateTemplateStore.getState().designs.course.backgroundImage,
      ).not.toBe('saved-bg.png');
    });

    await user.click(screen.getByRole('button', { name: 'Remove background' }));

    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      'saved-bg.png',
    );
  });

  it('shows a loading spinner while the saved template is being fetched', () => {
    const get: CertificateTemplateGateway['get'] = () =>
      new Promise(() => {
        // never resolves — simulates an in-flight request
      });
    renderManager({ get });
    expect(
      screen.getByRole('status', { name: 'Loading the saved certificate template…' }),
    ).toBeInTheDocument();
  });

  it('shows an error alert when loading the saved template fails', async () => {
    const get = vi.fn(() =>
      Promise.resolve(
        err(new CertificateTemplateLoadFailedError(new Error('network down'))),
      ),
    );
    renderManager({ get });

    expect(
      await screen.findByText('Could not load the existing certificate template.'),
    ).toBeInTheDocument();
  });

  it('shows a "no previous template" notice when the backend has nothing saved for this kind', async () => {
    renderManager();

    expect(await screen.findByText('No previous template')).toBeInTheDocument();
    await waitFor(() => {
      expect(useCertificateTemplateStore.getState().hydratedKinds.course).toBe(true);
    });
  });

  it('hides the "no previous template" notice once a first save just created one', async () => {
    renderManager();
    const user = userEvent.setup();
    await screen.findByText('No previous template');

    await user.click(screen.getByRole('button', { name: 'Save template' }));

    await waitFor(() => {
      expect(screen.queryByText('No previous template')).not.toBeInTheDocument();
    });
  });

  it('hydrates the store and shows an import notice from a legacy-format saved template', async () => {
    const get = vi.fn(() =>
      Promise.resolve(
        ok({ kind: 'course' as const, content: LEGACY_HTML, lastModificationTime: null }),
      ),
    );
    renderManager({ get });

    expect(
      await screen.findByText('Imported your previous certificate'),
    ).toBeInTheDocument();
    expect(useCertificateTemplateStore.getState().designs.course.heading).toBe(
      'Certificate\nOf Completion',
    );
    expect(useCertificateTemplateStore.getState().designs.course.backgroundImage).toBe(
      '/certificates/course/background.png',
    );
  });

  it('saving calls the upsert use case with the generated HTML and shows a success toast', async () => {
    const { upsert } = renderManager();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Save template' }));

    await waitFor(() => {
      expect(upsert).toHaveBeenCalledTimes(1);
    });
    const [kind, html] = upsert.mock.calls[0] as [string, string];
    expect(kind).toBe('course');
    expect(html).toContain('{{userName}}');
    expect(html).toContain('{{courseName}}');
    expect(html).toContain('{{qrCode}}');

    expect(await screen.findByText('Certificate template saved.')).toBeInTheDocument();
  });

  it('switching to the HTML source tab shows the currently-generated HTML', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'HTML source' }));

    const textbox = htmlSourceTextbox();
    expect(textbox.value).toContain('{{userName}}');
    expect(textbox.value).toContain('data-element="canvas"');
  });

  it('saving while the HTML source tab is open saves the typed HTML verbatim', async () => {
    const { upsert } = renderManager();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'HTML source' }));
    const textbox = htmlSourceTextbox();
    await user.clear(textbox);
    await user.type(textbox, '<html><body>hand-typed</body></html>');

    await user.click(screen.getByRole('button', { name: 'Save template' }));

    await waitFor(() => {
      expect(upsert).toHaveBeenCalledTimes(1);
    });
    const [, html] = upsert.mock.calls[0] as [string, string];
    expect(html).toBe('<html><body>hand-typed</body></html>');
  });

  it('applying edited HTML syncs recognizable changes back onto the visual canvas', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'HTML source' }));
    const textbox = htmlSourceTextbox();
    const withNewKicker = textbox.value.replace(
      'This is to certify that',
      'Presented with pride to',
    );
    await user.clear(textbox);
    await user.paste(withNewKicker);

    await user.click(screen.getByRole('button', { name: 'Apply to visual editor' }));

    expect(screen.getByRole('tab', { name: 'Visual editor' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(useCertificateTemplateStore.getState().designs.course.kicker).toBe(
      'Presented with pride to',
    );
  });

  it('shows an error and keeps the design untouched when the HTML cannot be recognized', async () => {
    renderManager();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'HTML source' }));
    const textbox = htmlSourceTextbox();
    await user.clear(textbox);
    await user.type(textbox, '<p>not a certificate template</p>');

    await user.click(screen.getByRole('button', { name: 'Apply to visual editor' }));

    expect(
      screen.getByText(/Could not recognize this HTML's structure/),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'HTML source' })).toHaveAttribute(
      'data-state',
      'active',
    );
  });
});
