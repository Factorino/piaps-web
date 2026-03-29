import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { employeesApi } from "@/features/employees/api";
import { departmentsApi } from "@/features/departments/api";
import { positionsApi } from "@/features/positions/api";
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
import type { FilterConfig } from "@/shared/ui/FilterPanel";
import type { EmployeeView } from "@/shared/types";
import { UserRole } from "@/shared/types";
import { fullName, formatDate } from "@/shared/utils";
import toast from "react-hot-toast";

export function EmployeesList() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [editItem, setEditItem] = useState<EmployeeView | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    hire_date: "",
    department_id: "",
    position_id: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["employees", sp.buildSearchRequest("full_name")],
    queryFn: () => employeesApi.search(sp.buildSearchRequest("full_name")),
  });

  const { data: depts } = useQuery({
    queryKey: ["departments", "all"],
    queryFn: () =>
      departmentsApi.search({ pagination: { page: 1, page_size: 100 } }),
  });
  const { data: positions } = useQuery({
    queryKey: ["positions", "all"],
    queryFn: () =>
      positionsApi.search({ pagination: { page: 1, page_size: 100 } }),
  });

  const deptMap = new Map(depts?.data.map((d) => [d.id, d.name]) ?? []);
  const posMap = new Map(positions?.data.map((p) => [p.id, p.name]) ?? []);

  const createMut = useMutation({
    mutationFn: () =>
      employeesApi.create({ ...form, middle_name: form.middle_name || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setIsCreateOpen(false);
      toast.success("Сотрудник создан");
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      employeesApi.update(editItem!.id, {
        last_name: form.last_name,
        first_name: form.first_name,
        middle_name: form.middle_name || null,
        department_id: form.department_id,
        position_id: form.position_id,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setEditItem(null);
      toast.success("Сотрудник обновлён");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setDeleteId(null);
      toast.success("Сотрудник удалён");
    },
  });

  function openEdit(e: EmployeeView) {
    setForm({
      last_name: e.last_name,
      first_name: e.first_name,
      middle_name: e.middle_name || "",
      hire_date: e.hire_date,
      department_id: e.department_id,
      position_id: e.position_id,
    });
    setEditItem(e);
  }

  const filterConfigs: FilterConfig[] = [
    {
      field: "department_id",
      label: "Отделение",
      type: "select",
      operator: "eq",
      options: depts?.data.map((d) => ({ value: d.id, label: d.name })) ?? [],
    },
    {
      field: "position_id",
      label: "Должность",
      type: "select",
      operator: "eq",
      options:
        positions?.data.map((p) => ({ value: p.id, label: p.name })) ?? [],
    },
  ];

  const columns: Column<EmployeeView>[] = [
    {
      key: "code",
      title: "Код",
      sortable: true,
      render: (d) => (
        <span className="badge-gray font-mono text-xs">{d.code}</span>
      ),
    },
    {
      key: "full_name",
      title: "ФИО",
      sortable: true,
      render: (d) => (
        <span className="font-medium">
          {fullName(d.last_name, d.first_name, d.middle_name)}
        </span>
      ),
    },
    {
      key: "department",
      title: "Отделение",
      render: (d) => deptMap.get(d.department_id) || "—",
    },
    {
      key: "position",
      title: "Должность",
      render: (d) => posMap.get(d.position_id) || "—",
    },
    {
      key: "hire_date",
      title: "Дата найма",
      sortable: true,
      render: (d) => formatDate(d.hire_date),
    },
    {
      key: "actions",
      title: "",
      className: "w-20",
      render: (d) => (
        <RoleGuard minRole={UserRole.ADMINISTRATOR}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Фамилия"
          value={form.last_name}
          onChange={(e) =>
            setForm({
              ...form,
              last_name: (e.target as HTMLInputElement).value,
            })
          }
          required
        />
        <FormField
          label="Имя"
          value={form.first_name}
          onChange={(e) =>
            setForm({
              ...form,
              first_name: (e.target as HTMLInputElement).value,
            })
          }
          required
        />
      </div>
      <FormField
        label="Отчество"
        value={form.middle_name}
        onChange={(e) =>
          setForm({
            ...form,
            middle_name: (e.target as HTMLInputElement).value,
          })
        }
      />
      <FormField
        label="Дата найма"
        type="date"
        value={form.hire_date}
        onChange={(e) =>
          setForm({ ...form, hire_date: (e.target as HTMLInputElement).value })
        }
        required
        disabled={!!editItem}
      />
      <SelectField
        label="Отделение"
        value={form.department_id}
        onChange={(e) => setForm({ ...form, department_id: e.target.value })}
        options={depts?.data.map((d) => ({ value: d.id, label: d.name })) ?? []}
        placeholder="Выберите отделение"
        required
      />
      <SelectField
        label="Должность"
        value={form.position_id}
        onChange={(e) => setForm({ ...form, position_id: e.target.value })}
        options={
          positions?.data.map((p) => ({ value: p.id, label: `${p.name}` })) ??
          []
        }
        placeholder="Выберите должность"
        required
      />
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
        title="Сотрудники"
        description="Управление сотрудниками клиники"
        actions={
          <RoleGuard minRole={UserRole.ADMINISTRATOR}>
            <button
              onClick={() => {
                setForm({
                  last_name: "",
                  first_name: "",
                  middle_name: "",
                  hire_date: new Date().toISOString().split("T")[0],
                  department_id: "",
                  position_id: "",
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
              placeholder="Поиск по ФИО..."
            />
          </div>
          <FilterPanel
            configs={filterConfigs}
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
        title="Новый сотрудник"
        size="lg"
      >
        {formContent}
      </Modal>
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Редактировать сотрудника"
        size="lg"
      >
        {formContent}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        message="Удалить этого сотрудника?"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
