import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { LoadingScreen } from "@/components/ui";
import { hasRole, useAuth, type Role } from "@/libs/auth";

/** Only signed-in users; others are sent to /login (and returned afterwards). */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/**
 * Only signed-out users (login page). Once authenticated, the user is sent back to the page
 * that required login (`state.from`), or to the dashboard.
 */
export function GuestOnly() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "authenticated") {
    const from = (location.state as { from?: Location } | null)?.from;
    return <Navigate to={from && from.pathname !== "/login" ? from : "/dashboard"} replace />;
  }

  return <Outlet />;
}

/** Only the listed roles; everyone else is redirected to the dashboard. */
export function RequireRole({ allow }: { allow: readonly Role[] }) {
  const { role } = useAuth();

  if (!hasRole(role, allow)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
