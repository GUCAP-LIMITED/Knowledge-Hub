import { useContext } from 'react';
import type { NotificationsModule } from '../notifications-module';
import { NotificationsModuleContext } from './notifications-module-context';

export const useNotificationsModule = (): NotificationsModule => {
  const module = useContext(NotificationsModuleContext);
  if (module === null) {
    throw new Error(
      'Notifications hooks must be used within <NotificationsModuleProvider>.',
    );
  }
  return module;
};
