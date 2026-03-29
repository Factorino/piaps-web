import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Shield, Key, UserCog, Link2 } from "lucide-react";
import { usersApi } from "@/features/users/api";
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
} from "@/shared/ui";
import type { Column } from "@/shared/ui/DataTable";
import type { UserView } from "@/shared/types";
import { UserRole, UserRoleLabel } from "@/shared/types";
import toast from "react-hot-toast";

const roleBadge: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: "badge-gray",
  [UserRole.ACCOUNTANT]: "badge-blue",
  [UserRole.ADMINISTRATOR]: "badge-green",
};

export function UsersList() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<UserView | null>(null);
  const [changePwUser, setChangePwUser] = useState<UserView | null>(null);
  const [bindUser, setBindUser] = useState<UserView | null>(null);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    role: UserRole.EMPLOYEE as UserRole,
  });
  const [newRole, setNewRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [pwForm, setPwForm] = useState({ new_password: "" });
  const [empCode, setEmpCode] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", sp.buildSearchRequest("username")],
    queryFn: () => usersApi.search(sp.buildSearchRequest("username")),
  });

  const createMut = useMutation({
    mutationFn: () =>
      usersApi.create({
        username: createForm.username,
        password: createForm.password,
        role: createForm.role,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setIsCreateOpen(false);
      toast.success("Пользователь создан");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setDeleteId(null);
      toast.success("Пользователь удалён");
    },
  });

  const changeRoleMut = useMutation({
    mutationFn: () => usersApi.changeRole(changeRoleUser!.id, newRole),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setChangeRoleUser(null);
      toast.success("Роль изменена");
    },
  });

  const changePwMut = useMutation({
    mutationFn: () =>
      usersApi.changePassword(changePwUser!.id, {
        old_password: null,
        new_password: pwForm.new_password,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setChangePwUser(null);
      setPwForm({ new_password: "" });
      toast.success("Пароль изменён");
    },
  });

  const bindMut = useMutation({
    mutationFn: () => usersApi.bindEmployee(bindUser!.id, empCode || null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setBindUser(null);
      setEmpCode("");
      toast.success("Привязка обновлена");
    },
  });

  const columns: Column<UserView>[] = [
    {
      key: "username",
      title: "Логин",
      sortable: true,
      render: (d) => (
        <span className="font-mono font-medium">{d.username}</span>
      ),
    },
    {
      key: "role",
      title: "Роль",
      sortable: true,
      render: (d) => (
        <span className={roleBadge[d.role]}>{UserRoleLabel[d.role]}</span>
      ),
    },
    {
      key: "employee_id",
      title: "Сотрудник",
      render: (d) =>
        d.employee_id ? (
          <span className="badge-blue text-xs">
            {d.employee_id.slice(0, 8)}…
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "actions",
      title: "",
      className: "w-40",
      render: (d) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setChangeRoleUser(d);
              setNewRole(d.role);
            }}
            className="btn-ghost btn-icon btn-sm"
            title="Роль"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setChangePwUser(d);
            }}
            className="btn-ghost btn-icon btn-sm"
            title="Пароль"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBindUser(d);
              setEmpCode("");
            }}
            className="btn-ghost btn-icon btn-sm"
            title="Привязка"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(d.id);
            }}
            className="btn-ghost btn-icon btn-sm text-red-500"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Пользователи"
        description="Управление пользователями системы"
        actions={
          <button
            onClick={() => {
              setCreateForm({
                username: "",
                password: "",
                role: UserRole.EMPLOYEE,
              });
              setIsCreateOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        }
      />

      <div className="card">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border-light dark:border-border-dark">
          <div className="flex-1">
            <SearchBar
              value={sp.searchQuery}
              onChange={sp.setSearchQuery}
              placeholder="Поиск по логину..."
            />
          </div>
          <FilterPanel
            configs={[
              {
                field: "role",
                label: "Роль",
                type: "select",
                operator: "eq",
                options: [
                  { value: "EMPLOYEE", label: "Сотрудник" },
                  { value: "ACCOUNTANT", label: "Бухгалтер" },
                  { value: "ADMINISTRATOR", label: "Администратор" },
                ],
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
        title="Новый пользователь"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="space-y-4"
        >
          <FormField
            label="Логин"
            value={createForm.username}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                username: (e.target as HTMLInputElement).value,
              })
            }
            required
          />
          <FormField
            label="Пароль"
            type="password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                password: (e.target as HTMLInputElement).value,
              })
            }
            required
          />
          <SelectField
            label="Роль"
            value={createForm.role}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                role: Number(e.target.value) as UserRole,
              })
            }
            options={Object.entries(UserRoleLabel).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
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

      <Modal
        open={!!changeRoleUser}
        onClose={() => setChangeRoleUser(null)}
        title="Изменить роль"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            changeRoleMut.mutate();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-500">
            Пользователь: <strong>{changeRoleUser?.username}</strong>
          </p>
          <SelectField
            label="Новая роль"
            value={newRole}
            onChange={(e) => setNewRole(Number(e.target.value) as UserRole)}
            options={Object.entries(UserRoleLabel).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setChangeRoleUser(null)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={changeRoleMut.isPending}
              className="btn-primary flex-1"
            >
              Сохранить
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!changePwUser}
        onClose={() => setChangePwUser(null)}
        title="Изменить пароль"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            changePwMut.mutate();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-500">
            Пользователь: <strong>{changePwUser?.username}</strong>
          </p>
          <FormField
            label="Новый пароль"
            type="password"
            value={pwForm.new_password}
            onChange={(e) =>
              setPwForm({ new_password: (e.target as HTMLInputElement).value })
            }
            required
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setChangePwUser(null)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={changePwMut.isPending}
              className="btn-primary flex-1"
            >
              Сохранить
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!bindUser}
        onClose={() => setBindUser(null)}
        title="Привязка к сотруднику"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            bindMut.mutate();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-500">
            Пользователь: <strong>{bindUser?.username}</strong>
          </p>
          <FormField
            label="Код сотрудника"
            value={empCode}
            onChange={(e) => setEmpCode((e.target as HTMLInputElement).value)}
            placeholder="EMP-a1b2c3d4"
            hint="Оставьте пустым для отвязки"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBindUser(null)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={bindMut.isPending}
              className="btn-primary flex-1"
            >
              Сохранить
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        message="Удалить этого пользователя?"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
