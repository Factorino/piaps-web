import { apiClient } from "@/shared/api/client";
import type {
  PayrollItemView,
  PaginationResult,
  SearchRequest,
  PayrollItemType,
  PayrollCalculationType,
} from "@/shared/types";

export const payrollItemsApi = {
  search: (params: SearchRequest) =>
    apiClient
      .post<{
        result: PaginationResult<PayrollItemView>;
      }>("/payroll-items/search", params)
      .then((r) => r.data.result),

  getById: (id: string) =>
    apiClient
      .get<{ payroll_item: PayrollItemView }>(`/payroll-items/${id}`)
      .then((r) => r.data.payroll_item),

  create: (data: {
    name: string;
    payroll_type: PayrollItemType;
    calc_type: PayrollCalculationType;
    value?: number | null;
  }) =>
    apiClient
      .post<{ payroll_item: PayrollItemView }>("/payroll-items", data)
      .then((r) => r.data.payroll_item),

  update: (
    id: string,
    data: {
      name?: string;
      payroll_type?: PayrollItemType;
      calc_type?: PayrollCalculationType;
      value?: number | null;
    },
  ) =>
    apiClient
      .patch<{ payroll_item: PayrollItemView }>(`/payroll-items/${id}`, data)
      .then((r) => r.data.payroll_item),

  delete: (id: string) => apiClient.delete(`/payroll-items/${id}`),
};
