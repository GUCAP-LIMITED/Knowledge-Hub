import type { CSSProperties, ReactElement } from 'react';

const MARK: CSSProperties = { fill: 'var(--color-academy-mark)' };
/** The accent bar is a fixed brand hex (not `--color-secondary`) — same in both logo variants. */
const ACCENT = '#FF8818';

/**
 * The Academy app's own mark (distinct from the UAPP parent/SSO mark — see `UappLogo`).
 * `--color-academy-mark` swaps teal/white per theme so it stays legible against
 * `--color-surface` (white in light mode, dark navy in dark mode).
 */
export const AcademyLogo = ({ size = 36 }: { readonly size?: number }): ReactElement => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1080 1080"
    fill="none"
    role="img"
    aria-label="UAPP Academy"
  >
    <path
      style={MARK}
      d="M539.835 800.795C539.835 800.795 450.742 712.601 450.742 611.516V497.79C450.742 497.79 458.343 423.773 539.835 423.773C621.326 423.773 627.653 499.587 627.653 499.587V612.278C627.653 612.278 623.511 712.066 539.835 800.783V800.795Z"
    />
    <path
      style={MARK}
      d="M459.959 746.029C460.892 746.587 432.583 712.634 422.046 659.986C411.51 607.339 414.525 551.38 414.525 551.38L414.127 456.61C414.127 456.61 310.129 392.231 203.32 382.594V660.282C203.32 660.282 344.116 675.927 459.947 746.029H459.959Z"
    />
    <path
      style={MARK}
      d="M203 692.469V766.485C374.483 768.294 540.3 872.986 540.3 872.986V841.844C425.412 722.257 203 692.469 203 692.469Z"
    />
    <path
      style={MARK}
      d="M540.266 841.859V873.002C540.266 873.002 706.071 768.298 877.565 766.501V692.484C877.565 692.484 655.153 722.273 540.266 841.859Z"
    />
    <path
      fill={ACCENT}
      d="M620.257 746.537C619.324 747.095 647.633 713.142 658.17 660.494C668.695 607.846 665.691 551.888 665.691 551.888L666.089 457.118C666.089 457.118 770.087 392.739 876.895 383.102V660.79C876.895 660.79 736.1 676.435 620.268 746.537H620.257Z"
    />
    <path
      style={MARK}
      d="M540.034 384.366C589.013 384.366 628.717 344.661 628.717 295.683C628.717 246.705 589.013 207 540.034 207C491.056 207 451.352 246.705 451.352 295.683C451.352 344.661 491.056 384.366 540.034 384.366Z"
    />
  </svg>
);
