import type { LoginUser } from "@/libs/api/types";
import { deleteCookie, getCookie, setCookie } from "@/libs/utils/cookie";
import type { RoleScope } from "./AuthContext";

const ACCESS_TOKEN_KEY = "ethicalden_crm_access";
const REFRESH_TOKEN_KEY = "ethicalden_crm_refresh";
const USER_KEY = "ethicalden_crm_user";
const SCOPE_KEY = "ethicalden_crm_scope";

const FALLBACK_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function saveSession(access: string, refresh: string, user: LoginUser) {
  const sessionExpiry = tokenExpiry(refresh) ?? fallbackExpiry();

  setCookie(ACCESS_TOKEN_KEY, access, { expires: tokenExpiry(access) ?? sessionExpiry });
  setCookie(REFRESH_TOKEN_KEY, refresh, { expires: sessionExpiry });
  setCookie(USER_KEY, JSON.stringify(user), { expires: sessionExpiry });
}

export function saveStoredUser(user: LoginUser) {
  setCookie(USER_KEY, JSON.stringify(user), { expires: sessionExpiry() });
}

export function getAccessToken() {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): LoginUser | null {
  return readJson<LoginUser>(USER_KEY);
}

export function saveStoredScope(scope: RoleScope) {
  const compact: RoleScope = {
    role: scope.role,
    userId: scope.userId,
    email: scope.email,
  };
  setCookie(SCOPE_KEY, JSON.stringify(compact), { expires: sessionExpiry() });
}

export function getStoredScope(): RoleScope | null {
  return readJson<RoleScope>(SCOPE_KEY);
}

export function clearSession() {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, SCOPE_KEY].forEach((key) => {
    deleteCookie(key);
  });
}

function readJson<T>(key: string): T | null {
  const value = getCookie(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    deleteCookie(key);
    return null;
  }
}

function sessionExpiry() {
  const refresh = getCookie(REFRESH_TOKEN_KEY);
  return (refresh && tokenExpiry(refresh)) || fallbackExpiry();
}

function fallbackExpiry() {
  return new Date(Date.now() + FALLBACK_LIFETIME_MS);
}

function tokenExpiry(token: string): Date | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "="));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;

    return typeof exp === "number" ? new Date(exp * 1000) : null;
  } catch {
    return null;
  }
}
