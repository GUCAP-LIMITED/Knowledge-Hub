import { useContext } from 'react';
import type { PlaybackModule } from '../playback-module';
import { PlaybackModuleContext } from './playback-module-context';

export const usePlaybackModule = (): PlaybackModule => {
  const module = useContext(PlaybackModuleContext);
  if (!module) {
    throw new Error('usePlaybackModule must be used within a PlaybackModuleProvider');
  }
  return module;
};
