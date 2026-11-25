import { useNavigate, useLocation } from 'react-router-dom';
import { buildPortalParams, useAuth, usePortalConfig } from '@features/auth';

/**
 * Sign out, then show the sign-in screen carrying the SSO params, so signing in again returns the
 * user to the page they left.
 */
export const useSignOut = (): (() => void) => {
  const { logout } = useAuth();
  const portal = usePortalConfig();
  const navigate = useNavigate();
  const location = useLocation();

  return (): void => {
    const search = buildPortalParams(portal, {
      origin: window.location.origin,
      pathname: location.pathname,
    });
    void logout().then(() => {
      navigate(`/login?${search.toString()}`, { replace: true });
    });
  };
};
