export type MediaKind = 'video' | 'pdf' | 'image' | 'doc' | 'link';

/** A viewable media asset with a resolved URL and media kind. */
export interface MediaAsset {
  readonly kind: MediaKind;
  readonly url: string;
  readonly name: string;
}
