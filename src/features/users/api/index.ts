import { apiClient } from "@/shared/api/client";
import type {
  UserView,
  UserRole,
  PaginationResult,
  SearchRequest,
} from "@/shared/types";

export const usersApi = {
  search: (params: SearchRequest) =>
    apiClient
      .post<{ result: PaginationResult<UserView> }>("/users/search", params)
      .then((r) => r.data.result),

  getById: (id: string) =>
    apiClient.get<{ user: UserView }>(`/users/${id}`).then((r) => r.data.user),

  getCurrent: () =>
    apiClient.get<{ user: UserView }>("/users/me").then((r) => r.data.user),

  create: (data: {
    username: string;
    password: string;
    role: UserRole;
    employee_id?: string | null;
  }) =>
    apiClient.post<{ user: UserView }>("/users", data).then((r) => r.data.user),

  delete: (id: string) => apiClient.delete(`/users/${id}`),

  changeUsername: (id: string, username: string) =>
    apiClient
      .patch<{ user: UserView }>(`/users/${id}/username`, { username })
      .then((r) => r.data.user),

  changePassword: (
    id: string,
    data: { old_password: string | null; new_password: string },
  ) =>
    apiClient
      .patch<{ user: UserView }>(`/users/${id}/password`, data)
      .then((r) => r.data.user),

  changeRole: (id: string, role: UserRole) =>
    apiClient
      .patch<{ user: UserView }>(`/users/${id}/role`, { role })
      .then((r) => r.data.user),

  bindEmployee: (id: string, employee_code: string | null) =>
    apiClient
      .patch<{ user: UserView }>(`/users/${id}/employee`, { employee_code })
      .then((r) => r.data.user),
};
