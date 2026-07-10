export type MediaKind = 'video' | 'pdf' | 'image' | 'doc' | 'link';

/** A viewable asset. In this offline prototype the URLs point at public sample files. */
export interface MediaAsset {
  readonly kind: MediaKind;
  readonly url: string;
  readonly name: string;
}

/** Stable public sample files standing in for real uploads (there is no backend yet). */
const SAMPLE: Record<'video' | 'pdf' | 'doc', string> = {
  video:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  pdf: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  doc: 'https://calibre-ebook.com/downloads/demos/demo.docx',
};

/** Build a demo asset of the given kind (placeholder media until real files are stored). */
export const demoAsset = (kind: 'video' | 'pdf' | 'doc', name: string): MediaAsset => ({
  kind,
  name,
  url: SAMPLE[kind],
});

/** Infer the media kind from an uploaded data-URL's MIME type. */
const kindFromDataUrl = (url: string): MediaKind => {
  if (url.startsWith('data:video')) {
    return 'video';
  }
  if (url.startsWith('data:image')) {
    return 'image';
  }
  if (url.startsWith('data:application/pdf')) {
    return 'pdf';
  }
  return 'doc';
};

/** Build an asset from an admin-uploaded file (stored as a data URL). */
export const uploadedAsset = (url: string, name: string): MediaAsset => ({
  kind: kindFromDataUrl(url),
  name,
  url,
});
