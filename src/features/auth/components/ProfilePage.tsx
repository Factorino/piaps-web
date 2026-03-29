import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Key, AtSign, Shield, Briefcase, Hash } from "lucide-react";
import { usersApi } from "@/features/users/api";
import { useAuthStore } from "@/stores/auth";
import { PageHeader, FormField, Modal } from "@/shared/ui";
import { UserRoleLabel } from "@/shared/types";
import toast from "react-hot-toast";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setTokens = useAuthStore((s) => s.setTokens);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const changeUsernameMut = useMutation({
    mutationFn: () => usersApi.changeUsername(user!.id, newUsername),
    onSuccess: (updatedUser) => {
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken, updatedUser);
      }
      toast.success("Логин изменён");
      setUsernameModalOpen(false);
      setNewUsername("");
    },
  });

  const changePwMut = useMutation({
    mutationFn: () =>
      usersApi.changePassword(user!.id, {
        old_password: oldPw,
        new_password: newPw,
      }),
    onSuccess: () => {
      toast.success("Пароль изменён");
      setPasswordModalOpen(false);
      setOldPw("");
      setNewPw("");
    },
  });

  if (!user) return null;

  const openUsernameModal = () => {
    setNewUsername(user.username);
    setUsernameModalOpen(true);
  };

  const openPasswordModal = () => {
    setOldPw("");
    setNewPw("");
    setPasswordModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Личный кабинет"
        description="Информация и настройки аккаунта"
      />

      <div className="space-y-6">
        {/* User info card */}
        <div className="card divide-y divide-border-light dark:divide-border-dark">
          <div className="px-6 py-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <User className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-lg font-display font-bold">
                  {user.username}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {UserRoleLabel[user.role]}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={<Hash className="w-4 h-4" />}
                label="ID пользователя"
                value={user.id}
                mono
              />
              {user.employee_id && (
                <InfoRow
                  icon={<Briefcase className="w-4 h-4" />}
                  label="ID сотрудника"
                  value={user.employee_id}
                  mono
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 space-y-2">
            <button
              onClick={openUsernameModal}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <AtSign className="w-4.5 h-4.5 text-slate-400" />
              Изменить логин
            </button>
            <button
              onClick={openPasswordModal}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <Key className="w-4.5 h-4.5 text-slate-400" />
              Изменить пароль
            </button>
          </div>
        </div>
      </div>

      {/* Change username modal */}
      <Modal
        open={usernameModalOpen}
        onClose={() => setUsernameModalOpen(false)}
        title="Изменить логин"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            changeUsernameMut.mutate();
          }}
          className="space-y-4"
        >
          <FormField
            label="Новый логин"
            value={newUsername}
            onChange={(e) =>
              setNewUsername((e.target as HTMLInputElement).value)
            }
            required
            hint="Только строчные латинские буквы и цифры, от 3 символов"
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setUsernameModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={
                changeUsernameMut.isPending ||
                newUsername === user.username ||
                !newUsername
              }
              className="btn-primary flex-1"
            >
              {changeUsernameMut.isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change password modal */}
      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
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
          <FormField
            label="Текущий пароль"
            type="password"
            value={oldPw}
            onChange={(e) => setOldPw((e.target as HTMLInputElement).value)}
            required
          />
          <FormField
            label="Новый пароль"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw((e.target as HTMLInputElement).value)}
            required
            hint="Минимум 8 символов"
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={changePwMut.isPending || !oldPw || !newPw}
              className="btn-primary flex-1"
            >
              {changePwMut.isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p
          className={`text-sm truncate ${mono ? "font-mono text-xs text-slate-500 dark:text-slate-400" : "font-medium"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
