import { createContext } from 'react';
import type { PlaybackModule } from '../playback-module';

export const PlaybackModuleContext = createContext<PlaybackModule | null>(null);
