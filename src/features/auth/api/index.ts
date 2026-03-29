import { apiClient } from "@/shared/api/client";
import type { LoginResponse, RegisterRequest, UserView } from "@/shared/types";

export const authApi = {
  login: (username: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    return apiClient
      .post<LoginResponse>("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((r) => r.data);
  },

  register: (data: RegisterRequest) =>
    apiClient
      .post<{ user: UserView }>("/auth/register", data)
      .then((r) => r.data),

  refresh: (refresh_token: string) =>
    apiClient
      .post<LoginResponse>("/auth/refresh", { refresh_token })
      .then((r) => r.data),
};
