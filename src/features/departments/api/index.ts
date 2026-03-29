import { apiClient } from "@/shared/api/client";
import type {
  DepartmentView,
  PaginationResult,
  SearchRequest,
} from "@/shared/types";

export const departmentsApi = {
  search: (params: SearchRequest) =>
    apiClient
      .post<{
        result: PaginationResult<DepartmentView>;
      }>("/departments/search", params)
      .then((r) => r.data.result),

  getById: (id: string) =>
    apiClient
      .get<{ department: DepartmentView }>(`/departments/${id}`)
      .then((r) => r.data.department),

  create: (data: { name: string; description?: string | null }) =>
    apiClient
      .post<{ department: DepartmentView }>("/departments", data)
      .then((r) => r.data.department),

  update: (id: string, data: { name?: string; description?: string | null }) =>
    apiClient
      .patch<{ department: DepartmentView }>(`/departments/${id}`, data)
      .then((r) => r.data.department),

  delete: (id: string) => apiClient.delete(`/departments/${id}`),
};
