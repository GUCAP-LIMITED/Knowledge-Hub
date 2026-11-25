import { useContext } from 'react';
import { DraftContext } from './draft-editor-context';
import type { DraftEditorState } from './draft-editor-types';

export const useDraftEditor = (): DraftEditorState => {
  const ctx = useContext(DraftContext);
  if (ctx === null) {
    throw new Error('useDraftEditor must be used within DraftEditorProvider');
  }
  return ctx;
};
