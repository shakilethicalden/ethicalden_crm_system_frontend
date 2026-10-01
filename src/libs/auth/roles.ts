import type { LoginUser, UserType } from "@/libs/api/types";

export type Role = UserType | "unknown";

export const ALL_ROLES: Role[] = ["super_admin", "team_leader", "lead_generator", "calling_agent"];
export const EMPLOYEE_MANAGERS: Role[] = ["super_admin"];
export const LEAD_CREATORS: Role[] = ["super_admin", "team_leader", "lead_generator"];
export const ASSIGNMENT_VIEWERS: Role[] = ["super_admin", "team_leader"];
export const AUDIT_VIEWERS: Role[] = ["super_admin"];

export function normalizeRole(value?: string | null): Role {
  const normalized = (value ?? "").toLowerCase();

  switch (normalized) {
    case "superadmin":
    case "super_admin":
      return "super_admin";
    case "team_lead":
    case "team_leader":
      return "team_leader";
    case "lead_generator":
      return "lead_generator";
    case "agent":
    case "calling_agent":
      return "calling_agent";
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

  if (!value) return "CRM user";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
