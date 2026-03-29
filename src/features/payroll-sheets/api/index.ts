import { apiClient } from "@/shared/api/client";
import type {
  PayrollSheetView,
  PaginationResult,
  SearchRequest,
} from "@/shared/types";

export const payrollSheetsApi = {
  search: (params: SearchRequest) =>
    apiClient
      .post<{
        result: PaginationResult<PayrollSheetView>;
      }>("/payroll-sheets/search", params)
      .then((r) => r.data.result),

  getById: (id: string) =>
    apiClient
      .get<{ payroll_sheet: PayrollSheetView }>(`/payroll-sheets/${id}`)
      .then((r) => r.data.payroll_sheet),

  create: (data: { employee_id: string; period: string }) =>
    apiClient
      .post<{ payroll_sheet: PayrollSheetView }>("/payroll-sheets", data)
      .then((r) => r.data.payroll_sheet),

  addRecord: (
    sheetId: string,
    data: {
      payroll_item_id: string;
      amount?: number | null;
      comment?: string | null;
    },
  ) =>
    apiClient
      .post<{
        payroll_sheet: PayrollSheetView;
      }>(`/payroll-sheets/${sheetId}/records`, data)
      .then((r) => r.data.payroll_sheet),

  removeRecord: (sheetId: string, recordId: string) =>
    apiClient
      .delete<{
        payroll_sheet: PayrollSheetView;
      }>(`/payroll-sheets/${sheetId}/records/${recordId}`)
      .then((r) => r.data.payroll_sheet),

  confirm: (id: string) =>
    apiClient
      .post<{
        payroll_sheet: PayrollSheetView;
      }>(`/payroll-sheets/${id}/confirm`)
      .then((r) => r.data.payroll_sheet),

  cancel: (id: string) =>
    apiClient
      .post<{ payroll_sheet: PayrollSheetView }>(`/payroll-sheets/${id}/cancel`)
      .then((r) => r.data.payroll_sheet),
};
