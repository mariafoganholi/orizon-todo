import { Navigate, Outlet } from "react-router-dom";
import {
  useAuthActions,
  useAuthUser,
  useIsAuthenticated,
  type AuthUser,
} from "./AuthProvider";
import { useCallback } from "react";
import { ApiAuthError } from "../api/auth";

export interface AuthOutletContext {
  user: AuthUser;
  handleAuthError: (err: unknown) => boolean;
  logout: () => boolean;
}

export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { isLoading, onAuthError, logout } = useAuthActions();

  const handleAuthError = useCallback((err: unknown) => {
    if (!(err instanceof ApiAuthError)) return false;
    onAuthError();
    return true;
  }, []);

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ user, handleAuthError, logout }} />;
}
