import type { ReactElement, ReactNode } from 'react';
import type { NotificationsModule } from '../notifications-module';
import { NotificationsModuleContext } from './notifications-module-context';

export interface NotificationsModuleProviderProps {
  readonly module: NotificationsModule;
  readonly children: ReactNode;
}

export const NotificationsModuleProvider = ({
  module,
  children,
}: NotificationsModuleProviderProps): ReactElement => (
  <NotificationsModuleContext.Provider value={module}>
    {children}
  </NotificationsModuleContext.Provider>
);
