import type { ReactElement } from 'react';
import { DraftContext } from './draft-editor-context';
import { useDraftState } from './use-draft-state';
import type { DraftEditorProviderProps } from './draft-editor-types';

export const DraftEditorProvider = ({
  content,
  revisionId,
  children,
}: DraftEditorProviderProps): ReactElement => {
  const value = useDraftState(content, revisionId);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};
