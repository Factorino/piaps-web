import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Download, BarChart3 } from "lucide-react";
import { reportsApi } from "@/features/reports/api";
import { employeesApi } from "@/features/employees/api";
import { departmentsApi } from "@/features/departments/api";
import { PageHeader, SelectField, FormField, StatusBadge } from "@/shared/ui";
import type {
  EmployeePayrollReportData,
  DepartmentPayrollReportData,
  PayrollSummaryReportData,
} from "@/shared/types";
import {
  PayrollStatus,
  PayrollStatusLabel,
  ReportFormat,
  PayrollItemType,
  PayrollItemTypeLabel,
} from "@/shared/types";
import { formatMoney, formatPeriod } from "@/shared/utils";
import toast from "react-hot-toast";

type ReportType = "employee" | "department" | "summary";

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [uiData, setUiData] = useState<
    | EmployeePayrollReportData
    | DepartmentPayrollReportData
    | PayrollSummaryReportData
    | null
  >(null);

  const { data: employees } = useQuery({
    queryKey: ["employees", "all"],
    queryFn: () =>
      employeesApi.search({ pagination: { page: 1, page_size: 100 } }),
  });
  const { data: departments } = useQuery({
    queryKey: ["departments", "all"],
    queryFn: () =>
      departmentsApi.search({ pagination: { page: 1, page_size: 100 } }),
  });

  const period = { value_from: dateFrom || null, value_to: dateTo || null };
  const statusVal = status ? (status as PayrollStatus) : null;

  const viewMut = useMutation({
    mutationFn: async () => {
      if (reportType === "employee")
        return reportsApi.employeePayroll({
          employee_id: employeeId,
          period,
          status: statusVal,
        });
      if (reportType === "department")
        return reportsApi.departmentPayroll({
          department_id: departmentId,
          period,
          status: statusVal,
        });
      return reportsApi.payrollSummary({ period, status: statusVal });
    },
    onSuccess: (data) => {
      setUiData(data as any);
    },
    onError: () => {
      toast.error("Ошибка получения отчёта");
    },
  });

  const downloadMut = useMutation({
    mutationFn: async (format: ReportFormat) => {
      if (reportType === "employee")
        return reportsApi.employeePayroll({
          employee_id: employeeId,
          period,
          status: statusVal,
          report_format: format,
        });
      if (reportType === "department")
        return reportsApi.departmentPayroll({
          department_id: departmentId,
          period,
          status: statusVal,
          report_format: format,
        });
      return reportsApi.payrollSummary({
        period,
        status: statusVal,
        report_format: format,
      });
    },
    onSuccess: () => {
      toast.success("Файл скачан");
    },
  });

  const canSubmit =
    reportType === "summary" ||
    (reportType === "employee" && employeeId) ||
    (reportType === "department" && departmentId);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Отчёты"
        description="Формирование отчётов по зарплате"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="font-display font-semibold">Параметры отчёта</h3>

          <SelectField
            label="Тип отчёта"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value as ReportType);
              setUiData(null);
            }}
            options={[
              { value: "summary", label: "Сводный отчёт" },
              { value: "department", label: "По отделению" },
              { value: "employee", label: "По сотруднику" },
            ]}
          />

          {reportType === "employee" && (
            <SelectField
              label="Сотрудник"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={
                employees?.data.map((e) => ({
                  value: e.id,
                  label: `${e.last_name} ${e.first_name}`,
                })) ?? []
              }
              placeholder="Выберите сотрудника"
            />
          )}
          {reportType === "department" && (
            <SelectField
              label="Отделение"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={
                departments?.data.map((d) => ({
                  value: d.id,
                  label: d.name,
                })) ?? []
              }
              placeholder="Выберите отделение"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Период с"
              type="date"
              value={dateFrom}
              onChange={(e) =>
                setDateFrom((e.target as HTMLInputElement).value)
              }
            />
            <FormField
              label="Период по"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo((e.target as HTMLInputElement).value)}
            />
          </div>

          <SelectField
            label="Статус листов"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={Object.entries(PayrollStatusLabel).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
            placeholder="Все статусы"
          />

          <div className="space-y-2 pt-2">
            <button
              onClick={() => viewMut.mutate()}
              disabled={!canSubmit || viewMut.isPending}
              className="btn-primary w-full"
            >
              <BarChart3 className="w-4 h-4" />
              {viewMut.isPending ? "Загрузка..." : "Показать"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadMut.mutate(ReportFormat.PDF)}
                disabled={!canSubmit || downloadMut.isPending}
                className="btn-secondary w-full"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                onClick={() => downloadMut.mutate(ReportFormat.EXCEL)}
                disabled={!canSubmit || downloadMut.isPending}
                className="btn-secondary w-full"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          {!uiData ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="font-medium">
                Выберите параметры и нажмите «Показать»
              </p>
            </div>
          ) : reportType === "summary" ? (
            <SummaryReport data={uiData as PayrollSummaryReportData} />
          ) : reportType === "department" ? (
            <DepartmentReport data={uiData as DepartmentPayrollReportData} />
          ) : (
            <EmployeeReport data={uiData as EmployeePayrollReportData} />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryReport({ data }: { data: PayrollSummaryReportData }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold">Сводный отчёт</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Сотрудников" value={data.total_employee_count} />
        <Stat
          label="Начислено"
          value={formatMoney(data.grand_total_accruals)}
          green
        />
        <Stat
          label="Удержано"
          value={formatMoney(data.grand_total_deductions)}
          red
        />
        <Stat
          label="К выплате"
          value={formatMoney(data.grand_total_net_salary)}
          blue
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            <th className="text-left py-2 px-3 font-medium text-slate-500">
              Отделение
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              Сотр.
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              Начислено
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              Удержано
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              К выплате
            </th>
          </tr>
        </thead>
        <tbody>
          {data.departments.map((d) => (
            <tr
              key={d.department_code}
              className="border-b border-border-light/50 dark:border-border-dark/50"
            >
              <td className="py-2 px-3 font-medium">{d.department_name}</td>
              <td className="py-2 px-3 text-right">{d.employee_count}</td>
              <td className="py-2 px-3 text-right text-emerald-600">
                {formatMoney(d.total_accruals)}
              </td>
              <td className="py-2 px-3 text-right text-red-600">
                {formatMoney(d.total_deductions)}
              </td>
              <td className="py-2 px-3 text-right font-medium">
                {formatMoney(d.total_net_salary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DepartmentReport({ data }: { data: DepartmentPayrollReportData }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold">
        Отчёт по отделению: {data.department_name}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Сотрудников" value={data.employee_count} />
        <Stat
          label="Начислено"
          value={formatMoney(data.total_accruals)}
          green
        />
        <Stat label="Удержано" value={formatMoney(data.total_deductions)} red />
        <Stat
          label="К выплате"
          value={formatMoney(data.total_net_salary)}
          blue
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            <th className="text-left py-2 px-3 font-medium text-slate-500">
              Сотрудник
            </th>
            <th className="text-left py-2 px-3 font-medium text-slate-500">
              Должность
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              Оклад
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              Начислено
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              Удержано
            </th>
            <th className="text-right py-2 px-3 font-medium text-slate-500">
              К выплате
            </th>
          </tr>
        </thead>
        <tbody>
          {data.employees.map((e) => (
            <tr
              key={e.employee_code}
              className="border-b border-border-light/50 dark:border-border-dark/50"
            >
              <td className="py-2 px-3 font-medium">{e.employee_full_name}</td>
              <td className="py-2 px-3 text-slate-500">{e.position_name}</td>
              <td className="py-2 px-3 text-right">
                {formatMoney(e.base_salary)}
              </td>
              <td className="py-2 px-3 text-right text-emerald-600">
                {formatMoney(e.accruals_sum)}
              </td>
              <td className="py-2 px-3 text-right text-red-600">
                {formatMoney(e.deductions_sum)}
              </td>
              <td className="py-2 px-3 text-right font-medium">
                {formatMoney(e.net_salary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeReport({ data }: { data: EmployeePayrollReportData }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold">
        Отчёт по сотруднику: {data.employee_full_name}
      </h3>
      <p className="text-sm text-slate-500">
        {data.department_name} · {data.position_name} · Оклад:{" "}
        {formatMoney(data.base_salary)}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Начислено"
          value={formatMoney(data.total_accruals)}
          green
        />
        <Stat label="Удержано" value={formatMoney(data.total_deductions)} red />
        <Stat
          label="К выплате"
          value={formatMoney(data.total_net_salary)}
          blue
        />
      </div>
      {data.sheets.map((s) => (
        <div
          key={s.period}
          className="border border-border-light dark:border-border-dark rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{formatPeriod(s.period)}</span>
            <span className="font-medium">{formatMoney(s.net_salary)}</span>
          </div>
          {s.records.length > 0 && (
            <table className="w-full text-xs">
              <tbody>
                {s.records.map((r, i) => (
                  <tr
                    key={i}
                    className="border-t border-border-light/50 dark:border-border-dark/50"
                  >
                    <td className="py-1 pr-2">{r.payroll_item_name}</td>
                    <td className="py-1">
                      <span
                        className={
                          r.payroll_type === PayrollItemType.ACCRUAL
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {PayrollItemTypeLabel[r.payroll_type]}
                      </span>
                    </td>
                    <td className="py-1 text-right font-medium">
                      {formatMoney(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  green,
  red,
  blue,
}: {
  label: string;
  value: string | number;
  green?: boolean;
  red?: boolean;
  blue?: boolean;
}) {
  const color = green
    ? "bg-emerald-50 dark:bg-emerald-900/20"
    : red
      ? "bg-red-50 dark:bg-red-900/20"
      : blue
        ? "bg-blue-50 dark:bg-blue-900/20"
        : "bg-slate-50 dark:bg-slate-800";
  return (
    <div className={`p-3 rounded-lg ${color} text-center`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-display font-bold text-sm">{value}</p>
    </div>
  );
}
