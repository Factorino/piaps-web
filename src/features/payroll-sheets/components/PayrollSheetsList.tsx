import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { payrollSheetsApi } from "@/features/payroll-sheets/api";
import { employeesApi } from "@/features/employees/api";
import { payrollItemsApi } from "@/features/payroll-items/api";
import { useSearchParams } from "@/shared/hooks";
import {
  SearchBar,
  DataTable,
  Pagination,
  PageHeader,
  ConfirmDialog,
  Modal,
  FormField,
  SelectField,
  StatusBadge,
  FilterPanel,
  RoleGuard,
} from "@/shared/ui";
import type { Column } from "@/shared/ui/DataTable";
import type { PayrollSheetView, PayrollRecordView } from "@/shared/types";
import {
  PayrollStatus,
  PayrollStatusLabel,
  PayrollItemType,
  PayrollItemTypeLabel,
  UserRole,
} from "@/shared/types";
import { formatMoney, formatPeriod, shortName } from "@/shared/utils";
import toast from "react-hot-toast";

export function PayrollSheetsList() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailSheet, setDetailSheet] = useState<PayrollSheetView | null>(null);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ employee_id: "", period: "" });
  const [recordForm, setRecordForm] = useState({
    payroll_item_id: "",
    amount: "",
    comment: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-sheets", sp.buildSearchRequest()],
    queryFn: () => payrollSheetsApi.search(sp.buildSearchRequest()),
  });

  const { data: employees } = useQuery({
    queryKey: ["employees", "all"],
    queryFn: () =>
      employeesApi.search({ pagination: { page: 1, page_size: 100 } }),
  });
  const { data: payrollItems } = useQuery({
    queryKey: ["payroll-items", "all"],
    queryFn: () =>
      payrollItemsApi.search({ pagination: { page: 1, page_size: 100 } }),
  });

  const empMap = new Map(
    employees?.data.map((e) => [
      e.id,
      shortName(e.last_name, e.first_name, e.middle_name),
    ]) ?? [],
  );

  const createMut = useMutation({
    mutationFn: () => payrollSheetsApi.create(createForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-sheets"] });
      setIsCreateOpen(false);
      toast.success("Расчётный лист создан");
    },
  });

  const confirmMut = useMutation({
    mutationFn: (id: string) => payrollSheetsApi.confirm(id),
    onSuccess: (sheet) => {
      qc.invalidateQueries({ queryKey: ["payroll-sheets"] });
      setDetailSheet(sheet);
      toast.success("Лист подтверждён");
    },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => payrollSheetsApi.cancel(id),
    onSuccess: (sheet) => {
      qc.invalidateQueries({ queryKey: ["payroll-sheets"] });
      setDetailSheet(sheet);
      toast.success("Лист отменён");
    },
  });

  const addRecordMut = useMutation({
    mutationFn: () =>
      payrollSheetsApi.addRecord(detailSheet!.id, {
        payroll_item_id: recordForm.payroll_item_id,
        amount: recordForm.amount ? Number(recordForm.amount) : null,
        comment: recordForm.comment || null,
      }),
    onSuccess: (sheet) => {
      qc.invalidateQueries({ queryKey: ["payroll-sheets"] });
      setDetailSheet(sheet);
      setAddRecordOpen(false);
      setRecordForm({ payroll_item_id: "", amount: "", comment: "" });
      toast.success("Запись добавлена");
    },
  });

  const removeRecordMut = useMutation({
    mutationFn: (recordId: string) =>
      payrollSheetsApi.removeRecord(detailSheet!.id, recordId),
    onSuccess: (sheet) => {
      qc.invalidateQueries({ queryKey: ["payroll-sheets"] });
      setDetailSheet(sheet);
      setDeleteRecordId(null);
      toast.success("Запись удалена");
    },
  });

  const calcTotals = (records: PayrollRecordView[]) => {
    const accruals = records
      .filter((r) => r.payroll_item.payroll_type === PayrollItemType.ACCRUAL)
      .reduce((s, r) => s + Number(r.amount), 0);
    const deductions = records
      .filter((r) => r.payroll_item.payroll_type === PayrollItemType.DEDUCTION)
      .reduce((s, r) => s + Number(r.amount), 0);
    return { accruals, deductions, net: accruals - deductions };
  };

  const columns: Column<PayrollSheetView>[] = [
    {
      key: "employee",
      title: "Сотрудник",
      render: (d) => (
        <span className="font-medium">
          {empMap.get(d.employee_id) || d.employee_id}
        </span>
      ),
    },
    {
      key: "period",
      title: "Период",
      sortable: true,
      render: (d) => formatPeriod(d.period),
    },
    {
      key: "status",
      title: "Статус",
      sortable: true,
      render: (d) => <StatusBadge status={d.status} />,
    },
    { key: "records", title: "Записей", render: (d) => d.records.length },
    {
      key: "net",
      title: "К выплате",
      render: (d) => {
        const t = calcTotals(d.records);
        return <span className="font-medium">{formatMoney(t.net)}</span>;
      },
    },
    {
      key: "actions",
      title: "",
      className: "w-12",
      render: (d) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDetailSheet(d);
          }}
          className="btn-ghost btn-icon btn-sm"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Расчётные листы"
        description="Управление начислениями и удержаниями"
        actions={
          <RoleGuard minRole={UserRole.ACCOUNTANT}>
            <button
              onClick={() => {
                setCreateForm({
                  employee_id: "",
                  period: new Date().toISOString().slice(0, 7) + "-01",
                });
                setIsCreateOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Создать лист
            </button>
          </RoleGuard>
        }
      />

      <div className="card">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border-light dark:border-border-dark">
          <div className="flex-1">
            <SearchBar
              value={sp.searchQuery}
              onChange={sp.setSearchQuery}
              placeholder="Поиск..."
            />
          </div>
          <FilterPanel
            configs={[
              {
                field: "status",
                label: "Статус",
                type: "select",
                operator: "eq",
                options: Object.entries(PayrollStatusLabel).map(([v, l]) => ({
                  value: v,
                  label: l,
                })),
              },
              {
                field: "employee_id",
                label: "Сотрудник",
                type: "select",
                operator: "eq",
                options:
                  employees?.data.map((e) => ({
                    value: e.id,
                    label: shortName(e.last_name, e.first_name, e.middle_name),
                  })) ?? [],
              },
            ]}
            active={sp.filters}
            onAdd={sp.addFilter}
            onRemove={sp.removeFilter}
            onClear={sp.clearFilters}
          />
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          sort={sp.sort}
          onSort={sp.toggleSort}
          isLoading={isLoading}
          onRowClick={setDetailSheet}
        />
        {data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={sp.setPage}
            onPageSizeChange={sp.setPageSize}
          />
        )}
      </div>

      {/* Create sheet */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Новый расчётный лист"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="space-y-4"
        >
          <SelectField
            label="Сотрудник"
            value={createForm.employee_id}
            onChange={(e) =>
              setCreateForm({ ...createForm, employee_id: e.target.value })
            }
            options={
              employees?.data.map((e) => ({
                value: e.id,
                label: shortName(e.last_name, e.first_name, e.middle_name),
              })) ?? []
            }
            placeholder="Выберите сотрудника"
            required
          />
          <FormField
            label="Период"
            type="date"
            value={createForm.period}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                period: (e.target as HTMLInputElement).value,
              })
            }
            required
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="btn-primary flex-1"
            >
              {createMut.isPending ? "Создание..." : "Создать"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail sheet */}
      <Modal
        open={!!detailSheet}
        onClose={() => setDetailSheet(null)}
        title={`Расчётный лист — ${detailSheet ? formatPeriod(detailSheet.period) : ""}`}
        size="xl"
      >
        {detailSheet &&
          (() => {
            const totals = calcTotals(detailSheet.records);
            const isDraft = detailSheet.status === PayrollStatus.DRAFT;
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {empMap.get(detailSheet.employee_id) ||
                        detailSheet.employee_id}
                    </span>
                    <StatusBadge status={detailSheet.status} />
                  </div>
                  <RoleGuard minRole={UserRole.ACCOUNTANT}>
                    <div className="flex gap-2">
                      {isDraft && (
                        <button
                          onClick={() => confirmMut.mutate(detailSheet.id)}
                          disabled={confirmMut.isPending}
                          className="btn-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Подтвердить
                        </button>
                      )}
                      {isDraft && (
                        <button
                          onClick={() => cancelMut.mutate(detailSheet.id)}
                          disabled={cancelMut.isPending}
                          className="btn-sm btn-danger"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Отменить
                        </button>
                      )}
                      {isDraft && (
                        <button
                          onClick={() => setAddRecordOpen(true)}
                          className="btn-sm btn-primary"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Запись
                        </button>
                      )}
                    </div>
                  </RoleGuard>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                      Начислено
                    </p>
                    <p className="font-display font-bold text-emerald-700 dark:text-emerald-300">
                      {formatMoney(totals.accruals)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                      Удержано
                    </p>
                    <p className="font-display font-bold text-red-700 dark:text-red-300">
                      {formatMoney(totals.deductions)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      К выплате
                    </p>
                    <p className="font-display font-bold text-blue-700 dark:text-blue-300">
                      {formatMoney(totals.net)}
                    </p>
                  </div>
                </div>

                {detailSheet.records.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-light dark:border-border-dark">
                        <th className="text-left py-2 px-3 font-medium text-slate-500">
                          Статья
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-slate-500">
                          Тип
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-slate-500">
                          Сумма
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-slate-500">
                          Комментарий
                        </th>
                        {isDraft && <th className="w-10"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {detailSheet.records.map((rec) => (
                        <tr
                          key={rec.id}
                          className="border-b border-border-light/50 dark:border-border-dark/50"
                        >
                          <td className="py-2 px-3">{rec.payroll_item.name}</td>
                          <td className="py-2 px-3">
                            <span
                              className={
                                rec.payroll_item.payroll_type ===
                                PayrollItemType.ACCRUAL
                                  ? "badge-green"
                                  : "badge-red"
                              }
                            >
                              {
                                PayrollItemTypeLabel[
                                  rec.payroll_item.payroll_type
                                ]
                              }
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatMoney(rec.amount)}
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {rec.comment || "—"}
                          </td>
                          {isDraft && (
                            <td className="py-2 px-3">
                              <RoleGuard minRole={UserRole.ACCOUNTANT}>
                                <button
                                  onClick={() => setDeleteRecordId(rec.id)}
                                  className="btn-ghost btn-icon btn-sm text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </RoleGuard>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-8 text-slate-400">Нет записей</p>
                )}
              </div>
            );
          })()}
      </Modal>

      {/* Add record */}
      <Modal
        open={addRecordOpen}
        onClose={() => setAddRecordOpen(false)}
        title="Добавить запись"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addRecordMut.mutate();
          }}
          className="space-y-4"
        >
          <SelectField
            label="Статья начисления"
            value={recordForm.payroll_item_id}
            onChange={(e) =>
              setRecordForm({ ...recordForm, payroll_item_id: e.target.value })
            }
            options={
              payrollItems?.data.map((pi) => ({
                value: pi.id,
                label: `${pi.name} (${PayrollItemTypeLabel[pi.payroll_type]})`,
              })) ?? []
            }
            placeholder="Выберите статью"
            required
          />
          <FormField
            label="Сумма (опционально)"
            type="number"
            step="0.01"
            value={recordForm.amount}
            onChange={(e) =>
              setRecordForm({
                ...recordForm,
                amount: (e.target as HTMLInputElement).value,
              })
            }
            hint="Оставьте пустым для автоматического расчёта"
          />
          <FormField
            label="Комментарий"
            value={recordForm.comment}
            onChange={(e) =>
              setRecordForm({
                ...recordForm,
                comment: (e.target as HTMLInputElement).value,
              })
            }
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddRecordOpen(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={addRecordMut.isPending}
              className="btn-primary flex-1"
            >
              {addRecordMut.isPending ? "Добавление..." : "Добавить"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteRecordId}
        onClose={() => setDeleteRecordId(null)}
        onConfirm={() =>
          deleteRecordId && removeRecordMut.mutate(deleteRecordId)
        }
        message="Удалить эту запись?"
        isLoading={removeRecordMut.isPending}
      />
    </div>
  );
}
