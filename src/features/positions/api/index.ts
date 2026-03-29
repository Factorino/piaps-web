import { apiClient } from "@/shared/api/client";
import type {
  PositionView,
  PaginationResult,
  SearchRequest,
} from "@/shared/types";

export const positionsApi = {
  search: (params: SearchRequest) =>
    apiClient
      .post<{
        result: PaginationResult<PositionView>;
      }>("/positions/search", params)
      .then((r) => r.data.result),

  getById: (id: string) =>
    apiClient
      .get<{ position: PositionView }>(`/positions/${id}`)
      .then((r) => r.data.position),

  create: (data: {
    name: string;
    base_salary: number;
    description?: string | null;
  }) =>
    apiClient
      .post<{ position: PositionView }>("/positions", data)
      .then((r) => r.data.position),

  update: (
    id: string,
    data: { name?: string; base_salary?: number; description?: string | null },
  ) =>
    apiClient
      .patch<{ position: PositionView }>(`/positions/${id}`, data)
      .then((r) => r.data.position),

  delete: (id: string) => apiClient.delete(`/positions/${id}`),
};
