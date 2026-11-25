/** A self-contained gradient thumbnail (data URI) so the demo needs no image hosting. */
export const svgThumb = (label: string, hue: number): string => {
  const initials = label
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${String(hue)},62%,34%)"/>` +
    `<stop offset="1" stop-color="hsl(${String((hue + 40) % 360)},58%,22%)"/>` +
    `</linearGradient></defs><rect width="640" height="360" fill="url(#g)"/>` +
    `<circle cx="540" cy="70" r="120" fill="#fff" fill-opacity="0.07"/>` +
    `<text x="40" y="320" font-family="Inter,Arial,sans-serif" font-size="96" font-weight="800" fill="#fff" fill-opacity="0.9">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
