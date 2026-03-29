import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { departmentsApi } from "@/features/departments/api";
import { useSearchParams } from "@/shared/hooks";
import {
  SearchBar,
  DataTable,
  Pagination,
  PageHeader,
  ConfirmDialog,
  Modal,
  FormField,
  FilterPanel,
  RoleGuard,
} from "@/shared/ui";
import type { Column } from "@/shared/ui/DataTable";
import type { DepartmentView } from "@/shared/types";
import { UserRole } from "@/shared/types";
import toast from "react-hot-toast";

export function DepartmentsList() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [editItem, setEditItem] = useState<DepartmentView | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["departments", sp.buildSearchRequest("name")],
    queryFn: () => departmentsApi.search(sp.buildSearchRequest("name")),
  });

  const createMut = useMutation({
    mutationFn: () =>
      departmentsApi.create({
        name: formData.name,
        description: formData.description || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setIsCreateOpen(false);
      toast.success("Отделение создано");
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      departmentsApi.update(editItem!.id, {
        name: formData.name,
        description: formData.description || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setEditItem(null);
      toast.success("Отделение обновлено");
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setDeleteId(null);
      toast.success("Отделение удалено");
    },
  });

  function resetForm() {
    setFormData({ name: "", description: "" });
  }
  function openEdit(item: DepartmentView) {
    setFormData({ name: item.name, description: item.description || "" });
    setEditItem(item);
  }
  function openCreate() {
    resetForm();
    setIsCreateOpen(true);
  }

  const columns: Column<DepartmentView>[] = [
    {
      key: "code",
      title: "Код",
      sortable: true,
      className: "font-mono text-xs",
      render: (d) => <span className="badge-gray font-mono">{d.code}</span>,
    },
    { key: "name", title: "Название", sortable: true },
    {
      key: "description",
      title: "Описание",
      render: (d) => (
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs block">
          {d.description || "—"}
        </span>
      ),
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
      <FormField
        label="Название"
        value={formData.name}
        onChange={(e) =>
          setFormData({
            ...formData,
            name: (e.target as HTMLInputElement).value,
          })
        }
        required
        placeholder="Терапевтическое отделение"
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="input-field min-h-[80px]"
          placeholder="Описание отделения"
        />
      </div>
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
        title="Отделения"
        description="Управление отделениями клиники"
        actions={
          <RoleGuard minRole={UserRole.ADMINISTRATOR}>
            <button onClick={openCreate} className="btn-primary">
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
              { field: "code", label: "Код", type: "text", operator: "ilike" },
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
        title="Новое отделение"
      >
        {formContent}
      </Modal>
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Редактировать отделение"
      >
        {formContent}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        message="Вы уверены, что хотите удалить это отделение?"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
