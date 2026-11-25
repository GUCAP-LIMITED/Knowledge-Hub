import { createContext } from 'react';
import type { DraftEditorState } from './draft-editor-types';

export const DraftContext = createContext<DraftEditorState | null>(null);
