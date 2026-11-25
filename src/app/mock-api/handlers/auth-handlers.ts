import type { Clock } from '@core/time';
import { MockHttpFailure, type MockRoute } from '../mock-types';
import { findMockUser } from '../seed/mock-users';
import { ACCESS_TOKEN_TTL_SECONDS, issueAccessToken } from '../seed/mock-tokens';

const REFRESH_PREFIX = 'mock-refresh:';

/** OpenIddict token endpoint: the `SsoSecret` and `refresh_token` grants. */
export const authHandlers = (clock: Clock): readonly MockRoute[] => [
  {
    method: 'POST',
    pattern: '/connect/token',
    handler: ({ body }) => {
      const form = (body ?? {}) as Record<string, string | undefined>;
      const userId =
        form.grant_type === 'refresh_token'
          ? (form.refresh_token ?? '').replace(REFRESH_PREFIX, '')
          : (form.secret ?? '');
      const user = findMockUser(userId);
      if (user === undefined) {
        throw new MockHttpFailure(400, 'invalid_grant', {
          error: 'invalid_grant',
          error_description: 'The SSO secret is invalid or has expired.',
        });
      }
      return {
        access_token: issueAccessToken(user, clock.now().getTime()),
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_TTL_SECONDS,
        refresh_token: `${REFRESH_PREFIX}${user.id}`,
      };
    },
  },
];
