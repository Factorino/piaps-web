import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  FilterPanel,
  RoleGuard,
} from "@/shared/ui";
import type { Column } from "@/shared/ui/DataTable";
import {
  PayrollItemType,
  PayrollItemTypeLabel,
  PayrollCalculationType,
  PayrollCalculationTypeLabel,
  UserRole,
} from "@/shared/types";
import type { PayrollItemView } from "@/shared/types";
import toast from "react-hot-toast";

export function PayrollItemsList() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [editItem, setEditItem] = useState<PayrollItemView | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    payroll_type: PayrollItemType.ACCRUAL as PayrollItemType,
    calc_type: PayrollCalculationType.FIXED as PayrollCalculationType,
    value: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-items", sp.buildSearchRequest("name")],
    queryFn: () => payrollItemsApi.search(sp.buildSearchRequest("name")),
  });

  const createMut = useMutation({
    mutationFn: () =>
      payrollItemsApi.create({
        name: form.name,
        payroll_type: form.payroll_type,
        calc_type: form.calc_type,
        value: form.value ? Number(form.value) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-items"] });
      setIsCreateOpen(false);
      toast.success("Статья создана");
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      payrollItemsApi.update(editItem!.id, {
        name: form.name,
        payroll_type: form.payroll_type,
        calc_type: form.calc_type,
        value: form.value ? Number(form.value) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-items"] });
      setEditItem(null);
      toast.success("Статья обновлена");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => payrollItemsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-items"] });
      setDeleteId(null);
      toast.success("Статья удалена");
    },
  });

  function openEdit(item: PayrollItemView) {
    setForm({
      name: item.name,
      payroll_type: item.payroll_type,
      calc_type: item.calc_type,
      value: item.value != null ? String(item.value) : "",
    });
    setEditItem(item);
  }

  const columns: Column<PayrollItemView>[] = [
    {
      key: "code",
      title: "Код",
      sortable: true,
      render: (d) => (
        <span className="badge-gray font-mono text-xs">{d.code}</span>
      ),
    },
    { key: "name", title: "Название", sortable: true },
    {
      key: "payroll_type",
      title: "Тип",
      sortable: true,
      render: (d) => (
        <span
          className={
            d.payroll_type === PayrollItemType.ACCRUAL
              ? "badge-green"
              : "badge-red"
          }
        >
          {PayrollItemTypeLabel[d.payroll_type]}
        </span>
      ),
    },
    {
      key: "calc_type",
      title: "Расчёт",
      sortable: true,
      render: (d) => PayrollCalculationTypeLabel[d.calc_type],
    },
    {
      key: "value",
      title: "Значение",
      render: (d) =>
        d.value != null
          ? `${d.value}${d.calc_type === PayrollCalculationType.PERCENT ? "%" : ""}`
          : "—",
    },
    {
      key: "actions",
      title: "",
      className: "w-20",
      render: (d) => (
        <RoleGuard minRole={UserRole.ACCOUNTANT}>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(d);
              }}
              className="btn-ghost btn-icon btn-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(d.id);
              }}
              className="btn-ghost btn-icon btn-sm text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </RoleGuard>
      ),
    },
  ];

  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        editItem ? updateMut.mutate() : createMut.mutate();
      }}
      className="space-y-4"
    >
      <FormField
        label="Название"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: (e.target as HTMLInputElement).value })
        }
        required
        placeholder="Оклад, Премия, НДФЛ..."
      />
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Тип"
          value={form.payroll_type}
          onChange={(e) =>
            setForm({
              ...form,
              payroll_type: e.target.value as PayrollItemType,
            })
          }
          options={Object.entries(PayrollItemTypeLabel).map(([v, l]) => ({
            value: v,
            label: l,
          }))}
        />
        <SelectField
          label="Тип расчёта"
          value={form.calc_type}
          onChange={(e) =>
            setForm({
              ...form,
              calc_type: e.target.value as PayrollCalculationType,
            })
          }
          options={Object.entries(PayrollCalculationTypeLabel).map(
            ([v, l]) => ({ value: v, label: l }),
          )}
        />
      </div>
      {form.calc_type === PayrollCalculationType.PERCENT && (
        <FormField
          label="Значение (%)"
          type="number"
          step="0.01"
          value={form.value}
          onChange={(e) =>
            setForm({ ...form, value: (e.target as HTMLInputElement).value })
          }
          required
          hint="Процент от базового оклада"
        />
      )}
      {form.calc_type === PayrollCalculationType.FIXED && (
        <FormField
          label="Значение (фикс.)"
          type="number"
          step="0.01"
          value={form.value}
          onChange={(e) =>
            setForm({ ...form, value: (e.target as HTMLInputElement).value })
          }
          hint="Оставьте пустым для ввода суммы при добавлении записи"
        />
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setEditItem(null);
            setIsCreateOpen(false);
          }}
          className="btn-secondary flex-1"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={createMut.isPending || updateMut.isPending}
          className="btn-primary flex-1"
        >
          {createMut.isPending || updateMut.isPending
            ? "Сохранение..."
            : "Сохранить"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Статьи начислений"
        description="Виды начислений и удержаний"
        actions={
          <RoleGuard minRole={UserRole.ACCOUNTANT}>
            <button
              onClick={() => {
                setForm({
                  name: "",
                  payroll_type: PayrollItemType.ACCRUAL,
                  calc_type: PayrollCalculationType.FIXED,
                  value: "",
                });
                setIsCreateOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Добавить
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
              placeholder="Поиск по названию..."
            />
          </div>
          <FilterPanel
            configs={[
              {
                field: "payroll_type",
                label: "Тип",
                type: "select",
                operator: "eq",
                options: Object.entries(PayrollItemTypeLabel).map(([v, l]) => ({
                  value: v,
                  label: l,
                })),
              },
              {
                field: "calc_type",
                label: "Расчёт",
                type: "select",
                operator: "eq",
                options: Object.entries(PayrollCalculationTypeLabel).map(
                  ([v, l]) => ({ value: v, label: l }),
                ),
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
        />
        {data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={sp.setPage}
            onPageSizeChange={sp.setPageSize}
          />
        )}
      </div>
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Новая статья"
      >
        {formContent}
      </Modal>
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Редактировать статью"
      >
        {formContent}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        message="Удалить эту статью?"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
