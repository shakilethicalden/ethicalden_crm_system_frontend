import { createContext } from "react";
import type { LoginUser } from "@/libs/api/types";
import type { Role } from "./roles";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/** The signed-in user's identity, resolved from the login response. */
export type RoleScope = {
  role: Role;
  userId: string;
  email: string;
};

export type AuthContextValue = {
  status: AuthStatus;
  user: LoginUser | null;
  scope: RoleScope;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Refresh scope from the locally stored login user. */
  refreshProfile: () => Promise<void>;
  /** Replace the stored login user. */
  updateUser: (user: LoginUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
