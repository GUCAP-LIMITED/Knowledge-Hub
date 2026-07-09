import { createContext } from 'react';
import type { NotificationsModule } from '../notifications-module';

export const NotificationsModuleContext = createContext<NotificationsModule | null>(null);
