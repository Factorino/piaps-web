import { apiClient } from "@/shared/api/client";
import type {
  DateBetween,
  PayrollStatus,
  ReportFormat,
  EmployeePayrollReportData,
  DepartmentPayrollReportData,
  PayrollSummaryReportData,
} from "@/shared/types";

interface EmployeeReportReq {
  employee_id: string;
  period: DateBetween;
  status?: PayrollStatus | null;
  report_format?: ReportFormat | null;
}
interface DepartmentReportReq {
  department_id: string;
  period: DateBetween;
  status?: PayrollStatus | null;
  report_format?: ReportFormat | null;
}
interface SummaryReportReq {
  period: DateBetween;
  status?: PayrollStatus | null;
  report_format?: ReportFormat | null;
}

export const reportsApi = {
  employeePayroll: (params: EmployeeReportReq) => {
    if (params.report_format) {
      return apiClient
        .post("/reports/employee", params, { responseType: "blob" })
        .then((r) => {
          const url = URL.createObjectURL(r.data);
          const disposition = r.headers["content-disposition"] || "";
          const match = disposition.match(/filename="?([^"]+)"?/);
          const filename =
            match?.[1] ||
            `employee_report.${params.report_format === "pdf" ? "pdf" : "xlsx"}`;
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        });
    }
    return apiClient
      .post<EmployeePayrollReportData>("/reports/employee", params)
      .then((r) => r.data);
  },

  departmentPayroll: (params: DepartmentReportReq) => {
    if (params.report_format) {
      return apiClient
        .post("/reports/department", params, { responseType: "blob" })
        .then((r) => {
          const url = URL.createObjectURL(r.data);
          const disposition = r.headers["content-disposition"] || "";
          const match = disposition.match(/filename="?([^"]+)"?/);
          const filename =
            match?.[1] ||
            `department_report.${params.report_format === "pdf" ? "pdf" : "xlsx"}`;
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        });
    }
    return apiClient
      .post<DepartmentPayrollReportData>("/reports/department", params)
      .then((r) => r.data);
  },

  payrollSummary: (params: SummaryReportReq) => {
    if (params.report_format) {
      return apiClient
        .post("/reports/summary", params, { responseType: "blob" })
        .then((r) => {
          const url = URL.createObjectURL(r.data);
          const disposition = r.headers["content-disposition"] || "";
          const match = disposition.match(/filename="?([^"]+)"?/);
          const filename =
            match?.[1] ||
            `summary_report.${params.report_format === "pdf" ? "pdf" : "xlsx"}`;
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        });
    }
    return apiClient
      .post<PayrollSummaryReportData>("/reports/summary", params)
      .then((r) => r.data);
  },
};
