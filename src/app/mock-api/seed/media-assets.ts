export interface MockMediaAsset {
  readonly id: string;
  /** Backend `MediaKind`: 0 video · 5 document. */
  readonly kind: number;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly url: string;
}

const VIDEO_A =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const VIDEO_B = 'https://www.w3schools.com/html/mov_bbb.mp4';
const PDF = '/samples/sample.pdf';

const video = (id: string, fileName: string, url: string): MockMediaAsset => ({
  id,
  kind: 0,
  fileName,
  mimeType: 'video/mp4',
  sizeBytes: 4_200_000,
  url,
});

const pdf = (id: string, fileName: string): MockMediaAsset => ({
  id,
  kind: 5,
  fileName,
  mimeType: 'application/pdf',
  sizeBytes: 1_100,
  url: PDF,
});

/** Demo media. Videos stream from public CC0 samples; documents are served from `/public/samples`. */
export const MOCK_MEDIA_ASSETS: readonly MockMediaAsset[] = [
  video('asset-vid-1', 'welcome.mp4', VIDEO_A),
  video('asset-vid-2', 'overview.mp4', VIDEO_B),
  video('asset-vid-3', 'walkthrough.mp4', VIDEO_A),
  video('asset-vid-4', 'deep-dive.mp4', VIDEO_B),
  video('asset-vid-5', 'case-study.mp4', VIDEO_A),
  video('asset-vid-6', 'recap.mp4', VIDEO_B),
  pdf('asset-pdf-1', 'handbook.pdf'),
  pdf('asset-pdf-2', 'checklist.pdf'),
  pdf('asset-pdf-3', 'reference-guide.pdf'),
];

export const findMediaAsset = (id: string): MockMediaAsset | undefined =>
  MOCK_MEDIA_ASSETS.find((asset) => asset.id === id);
