import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  RoleGuard,
} from "@/shared/ui";
import type { Column } from "@/shared/ui/DataTable";
import type { PositionView } from "@/shared/types";
import { UserRole } from "@/shared/types";
import { formatMoney } from "@/shared/utils";
import toast from "react-hot-toast";

export function PositionsList() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [editItem, setEditItem] = useState<PositionView | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    base_salary: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["positions", sp.buildSearchRequest("name")],
    queryFn: () => positionsApi.search(sp.buildSearchRequest("name")),
  });

  const createMut = useMutation({
    mutationFn: () =>
      positionsApi.create({
        name: formData.name,
        base_salary: Number(formData.base_salary),
        description: formData.description || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      setIsCreateOpen(false);
      toast.success("Должность создана");
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      positionsApi.update(editItem!.id, {
        name: formData.name,
        base_salary: Number(formData.base_salary),
        description: formData.description || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      setEditItem(null);
      toast.success("Должность обновлена");
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => positionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      setDeleteId(null);
      toast.success("Должность удалена");
    },
  });

  function resetForm() {
    setFormData({ name: "", base_salary: "", description: "" });
  }
  function openEdit(item: PositionView) {
    setFormData({
      name: item.name,
      base_salary: String(item.base_salary),
      description: item.description || "",
    });
    setEditItem(item);
  }

  const columns: Column<PositionView>[] = [
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
      key: "base_salary",
      title: "Базовый оклад",
      sortable: true,
      render: (d) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {formatMoney(d.base_salary)}
        </span>
      ),
    },
    {
      key: "description",
      title: "Описание",
      render: (d) => (
        <span className="text-slate-500 truncate max-w-xs block">
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
      />
      <FormField
        label="Базовый оклад"
        type="number"
        step="0.01"
        min="0"
        value={formData.base_salary}
        onChange={(e) =>
          setFormData({
            ...formData,
            base_salary: (e.target as HTMLInputElement).value,
          })
        }
        required
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
        title="Должности"
        description="Управление должностями клиники"
        actions={
          <RoleGuard minRole={UserRole.ADMINISTRATOR}>
            <button
              onClick={() => {
                resetForm();
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
        <div className="p-4 border-b border-border-light dark:border-border-dark">
          <SearchBar
            value={sp.searchQuery}
            onChange={sp.setSearchQuery}
            placeholder="Поиск по названию..."
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
        title="Новая должность"
      >
        {formContent}
      </Modal>
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Редактировать должность"
      >
        {formContent}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        message="Удалить эту должность?"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
