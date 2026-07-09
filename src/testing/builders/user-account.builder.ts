import { UserAccount, type UserAccountProps } from '@features/users/domain';

export type UserAccountOverrides = Partial<UserAccountProps>;

const DEFAULT_USER_ACCOUNT: UserAccountProps = {
  id: 'user-1',
  name: 'Simona',
  email: 'consultant@uapp.com',
  role: 'consultant',
  status: 'active',
  joined: 'Jan 2024',
  lastActive: '3 hours ago',
};

/** Construct a valid {@link UserAccount} for tests, overriding only what matters per case. */
export const buildUserAccount = (overrides: UserAccountOverrides = {}): UserAccount =>
  new UserAccount({ ...DEFAULT_USER_ACCOUNT, ...overrides });
