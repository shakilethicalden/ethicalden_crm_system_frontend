import type { LoginUser } from "@/libs/api/types";

export type Role = "admin" | "employee" | "unknown";

export const STAFF: Role[] = ["admin", "employee"];

export function normalizeRole(value?: string | null): Role {
  switch ((value ?? "").toLowerCase()) {
    case "admin":
    case "superadmin":
      return "admin";
    case "employee":
      return "employee";
    default:
      return "unknown";
  }
}

export function userRole(user: LoginUser | null): Role {
  return normalizeRole(user?.user_type ?? user?.role);
}

export function hasRole(role: Role, allowed: readonly Role[]) {
  return allowed.includes(role);
}

export function formatRoleLabel(user: LoginUser | null) {
  const value = user?.user_type ?? user?.role;

  if (!value) {
    return "CRM user";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
