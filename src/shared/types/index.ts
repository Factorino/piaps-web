// ── Enums ──
export enum UserRole {
  EMPLOYEE = 0,
  ACCOUNTANT = 1,
  ADMINISTRATOR = 2,
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: "Сотрудник",
  [UserRole.ACCOUNTANT]: "Бухгалтер",
  [UserRole.ADMINISTRATOR]: "Администратор",
};

export enum PayrollItemType {
  ACCRUAL = "accrual",
  DEDUCTION = "deduction",
}

export const PayrollItemTypeLabel: Record<PayrollItemType, string> = {
  [PayrollItemType.ACCRUAL]: "Начисление",
  [PayrollItemType.DEDUCTION]: "Удержание",
};

export enum PayrollCalculationType {
  FIXED = "fixed",
  PERCENT = "percent",
}

export const PayrollCalculationTypeLabel: Record<
  PayrollCalculationType,
  string
> = {
  [PayrollCalculationType.FIXED]: "Фиксированная",
  [PayrollCalculationType.PERCENT]: "Процент",
};

export enum PayrollStatus {
  DRAFT = "draft",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export const PayrollStatusLabel: Record<PayrollStatus, string> = {
  [PayrollStatus.DRAFT]: "Черновик",
  [PayrollStatus.CONFIRMED]: "Подтверждён",
  [PayrollStatus.CANCELLED]: "Отменён",
};

export enum ReportFormat {
  PDF = "pdf",
  EXCEL = "excel",
}

// ── Filter / Sort / Pagination ──
export type OperatorScalar = "eq" | "ne" | "gt" | "ge" | "lt" | "le";
export type OperatorStr = "like" | "ilike";
export type OperatorList = "in" | "not_in";
export type OperatorNull = "is_null" | "is_not_null";

export interface FilterParam {
  field: string;
  operator: OperatorScalar | OperatorStr | OperatorList | OperatorNull;
  value?: string | number | boolean | (string | number | boolean)[] | null;
}

export interface FilterDto {
  params: FilterParam[];
}

export type SortDirection = "asc" | "desc";

export interface SortParam {
  field: string;
  direction: SortDirection;
}

export interface SortDto {
  params: SortParam[];
}

export interface PaginationDto {
  page: number;
  page_size: number;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SearchRequest {
  filter?: FilterDto | null;
  sort?: SortDto | null;
  pagination?: PaginationDto;
}

// ── API Error ──
export interface ApiErrorResponse {
  status_code: number;
  error_type: string;
  message: string;
  detail?: Record<string, unknown>;
}

// ── Date Between ──
export interface DateBetween {
  value_from?: string | null;
  value_to?: string | null;
}

// ── Views ──
export interface DepartmentView {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface PositionView {
  id: string;
  code: string;
  name: string;
  base_salary: number;
  description?: string | null;
}

export interface EmployeeView {
  id: string;
  code: string;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  hire_date: string;
  department_id: string;
  position_id: string;
}

export interface UserView {
  id: string;
  username: string;
  role: UserRole;
  employee_id?: string | null;
}

export interface PayrollItemView {
  id: string;
  code: string;
  name: string;
  payroll_type: PayrollItemType;
  calc_type: PayrollCalculationType;
  value?: number | null;
}

export interface PayrollRecordView {
  id: string;
  employee_id: string;
  payroll_item: PayrollItemView;
  period: string;
  amount: number;
  comment?: string | null;
}

export interface PayrollSheetView {
  id: string;
  employee_id: string;
  period: string;
  status: PayrollStatus;
  records: PayrollRecordView[];
}

// ── Auth ──
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserView;
}

export interface RegisterRequest {
  username: string;
  password: string;
  employee_code?: string | null;
}

// ── Reports ──
export interface EmployeePayrollReportData {
  employee_code: string;
  employee_full_name: string;
  department_name: string;
  position_name: string;
  base_salary: number;
  sheets: PayrollSheetReportData[];
  total_accruals: number;
  total_deductions: number;
  total_net_salary: number;
}

export interface PayrollSheetReportData {
  period: string;
  accruals_sum: number;
  deductions_sum: number;
  net_salary: number;
  records: PayrollRecordReportData[];
}

export interface PayrollRecordReportData {
  payroll_item_code: string;
  payroll_item_name: string;
  payroll_type: PayrollItemType;
  amount: number;
  comment?: string | null;
}

export interface DepartmentPayrollReportData {
  department_code: string;
  department_name: string;
  period_from?: string | null;
  period_to?: string | null;
  employees: EmployeePayrollSummary[];
  total_base_salary: number;
  total_accruals: number;
  total_deductions: number;
  total_net_salary: number;
  employee_count: number;
}

export interface EmployeePayrollSummary {
  employee_code: string;
  employee_full_name: string;
  position_name: string;
  base_salary: number;
  accruals_sum: number;
  deductions_sum: number;
  net_salary: number;
}

export interface PayrollSummaryReportData {
  period_from?: string | null;
  period_to?: string | null;
  departments: DepartmentPayrollSummary[];
  total_employee_count: number;
  grand_total_base_salary: number;
  grand_total_accruals: number;
  grand_total_deductions: number;
  grand_total_net_salary: number;
}

export interface DepartmentPayrollSummary {
  department_code: string;
  department_name: string;
  employee_count: number;
  total_base_salary: number;
  total_accruals: number;
  total_deductions: number;
  total_net_salary: number;
}
