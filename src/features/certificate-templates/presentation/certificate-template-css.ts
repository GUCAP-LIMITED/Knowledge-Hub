/**
 * Plain, portable CSS mirroring `CertificateArtwork.module.css` — used only for the exported
 * standalone HTML template (backend's renderer has no access to the app's CSS Modules or design
 * tokens), so every `var(--color-*)` is resolved to its literal light-theme value here.
 */
export const CERTIFICATE_TEMPLATE_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f1f4f3; }
  .canvas {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
    background-color: #ffffff;
    background-size: cover;
    background-position: center;
  }
  .el { position: absolute; margin: 0; white-space: pre-wrap; line-height: 1.2; }
  .elQr { object-fit: contain; }
`;
