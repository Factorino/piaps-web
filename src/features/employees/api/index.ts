import { apiClient } from "@/shared/api/client";
import type {
  EmployeeView,
  PaginationResult,
  SearchRequest,
} from "@/shared/types";

export const employeesApi = {
  search: (params: SearchRequest) =>
    apiClient
      .post<{
        result: PaginationResult<EmployeeView>;
      }>("/employees/search", params)
      .then((r) => r.data.result),

  getById: (id: string) =>
    apiClient
      .get<{ employee: EmployeeView }>(`/employees/${id}`)
      .then((r) => r.data.employee),

  create: (data: {
    last_name: string;
    first_name: string;
    middle_name?: string | null;
    hire_date: string;
    department_id: string;
    position_id: string;
  }) =>
    apiClient
      .post<{ employee: EmployeeView }>("/employees", data)
      .then((r) => r.data.employee),

  update: (
    id: string,
    data: {
      last_name?: string;
      first_name?: string;
      middle_name?: string | null;
      department_id?: string;
      position_id?: string;
    },
  ) =>
    apiClient
      .patch<{ employee: EmployeeView }>(`/employees/${id}`, data)
      .then((r) => r.data.employee),

  delete: (id: string) => apiClient.delete(`/employees/${id}`),
};
