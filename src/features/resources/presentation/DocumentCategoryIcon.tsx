import { type ReactElement } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video as VideoIcon,
  File as GenericFileIcon,
} from 'lucide-react';
import { type DocumentCategory } from './resource-format-helper';

export interface DocumentCategoryIconProps {
  readonly category: DocumentCategory;
  readonly size?: number | undefined;
}

export const DocumentCategoryIcon = ({
  category,
  size = 18,
}: DocumentCategoryIconProps): ReactElement => {
  switch (category) {
    case 'pdf':
    case 'word':
      return <FileText size={size} aria-hidden="true" />;
    case 'excel':
      return <FileSpreadsheet size={size} aria-hidden="true" />;
    case 'powerpoint':
      return <Presentation size={size} aria-hidden="true" />;
    case 'image':
      return <ImageIcon size={size} aria-hidden="true" />;
    case 'video':
      return <VideoIcon size={size} aria-hidden="true" />;
    case 'text':
    case 'other':
      return <GenericFileIcon size={size} aria-hidden="true" />;
  }
};
