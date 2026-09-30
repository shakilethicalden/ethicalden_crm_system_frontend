import { useCallback, useMemo, useState, type ReactNode } from "react";
import { clearApiCache } from "@/libs/api/client";
import type { LoginUser } from "@/libs/api/types";
import { clearQueryStore } from "@/libs/hooks/useAsyncData";
import { authService } from "@/libs/services/auth.service";
import { AuthContext, type AuthContextValue, type AuthStatus, type RoleScope } from "./AuthContext";
import { userRole } from "./roles";
import {
  clearSession,
  getAccessToken,
  getStoredScope,
  getStoredUser,
  saveSession,
  saveStoredScope,
  saveStoredUser,
} from "./session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (getAccessToken() ? "authenticated" : "unauthenticated"));
  const [user, setUser] = useState<LoginUser | null>(() => getStoredUser());
  const [scope, setScope] = useState<RoleScope>(() => getStoredScope() ?? scopeFromUser(getStoredUser()));

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);

    if (!result.success || !result.data) {
      throw new Error(result.message || "Login failed.");
    }

    clearApiCache();
    clearQueryStore();
    saveSession(result.data.access, result.data.refresh, result.data.user);
    saveStoredUser(result.data.user);
    setUser(result.data.user);

    const nextScope = scopeFromUser(result.data.user);
    saveStoredScope(nextScope);
    setScope(nextScope);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    clearSession();
    clearApiCache();
    clearQueryStore();
    setUser(null);
    setScope(scopeFromUser(null));
    setStatus("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    const nextScope = scopeFromUser(getStoredUser());
    saveStoredScope(nextScope);
    setScope(nextScope);
  }, []);

  const updateUser = useCallback((nextUser: LoginUser) => {
    saveStoredUser(nextUser);
    setUser(nextUser);
    const nextScope = scopeFromUser(nextUser);
    saveStoredScope(nextScope);
    setScope(nextScope);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, scope, role: scope.role, login, logout, refreshProfile, updateUser }),
    [status, user, scope, login, logout, refreshProfile, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function scopeFromUser(user: LoginUser | null): RoleScope {
  return {
    role: userRole(user),
    userId: user?.id ? String(user.id) : "",
    email: user?.email ?? "",
  };
}
