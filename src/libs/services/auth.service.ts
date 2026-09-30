import { apiRequest } from "@/libs/api/client";
import type { LoginResponse } from "@/libs/api/types";

export const authService = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>("/auth/login/", {
      method: "POST",
      data: { email, password },
      skipAuth: true,
    });
  },
};
