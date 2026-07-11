import type { CSSProperties, ReactElement } from 'react';

const TEAL: CSSProperties = { fill: 'var(--color-primary)' };
const ORANGE: CSSProperties = { fill: 'var(--color-secondary)' };

/** The UAPP graduation-cap mark, matching the SSO. Brand colours come from the design tokens. */
export const UappLogo = ({ size = 36 }: { readonly size?: number }): ReactElement => (
  <svg
    width={size}
    height={Math.round((size * 40) / 36)}
    viewBox="0 0 36 40"
    fill="none"
    role="img"
    aria-label="UAPP"
  >
    <path
      style={TEAL}
      d="M13.4844 12.6396L4.32812 9.51172V26.8705C4.32812 34.028 10.4105 39.8311 17.9126 39.8311C25.4146 39.8311 31.497 34.028 31.497 26.8705V9.51172L22.4731 12.6396L22.4061 16.5363H24.1555V26.8722C24.1555 30.1632 21.3603 32.83 17.9108 32.83C14.4614 32.83 11.6662 30.1632 11.6662 26.8722V16.5363H13.4156L13.4826 12.6396H13.4844Z"
    />
    <path
      style={ORANGE}
      d="M17.918 0.171875L0 6.0252L17.918 11.8802L35.836 6.0252L17.918 0.171875Z"
    />
    <path
      style={ORANGE}
      d="M36.0009 11.3586C36.0009 11.1433 35.8739 10.9582 35.6888 10.864L35.5194 6.01172H35.336L35.1667 10.8522C34.9674 10.9414 34.8281 11.1348 34.8281 11.3586C34.8281 11.5689 34.9498 11.754 35.1315 11.8482L35.0838 13.1992C35.068 13.6586 35.2232 13.8537 35.4277 13.8537C35.6323 13.8537 35.7875 13.6569 35.7716 13.1992L35.724 11.8348C35.8916 11.7355 36.0027 11.5605 36.0027 11.3586H36.0009Z"
    />
  </svg>
);
