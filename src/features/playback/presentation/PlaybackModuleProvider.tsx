import type { ReactElement, ReactNode } from 'react';
import type { PlaybackModule } from '../playback-module';
import { PlaybackModuleContext } from './playback-module-context';

export interface PlaybackModuleProviderProps {
  readonly module: PlaybackModule;
  readonly children: ReactNode;
}

export const PlaybackModuleProvider = ({
  module,
  children,
}: PlaybackModuleProviderProps): ReactElement => (
  <PlaybackModuleContext.Provider value={module}>
    {children}
  </PlaybackModuleContext.Provider>
);
