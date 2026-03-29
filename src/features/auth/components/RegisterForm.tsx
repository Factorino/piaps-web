import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Stethoscope } from "lucide-react";
import { authApi } from "@/features/auth/api";
import toast from "react-hot-toast";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      authApi.register({
        username,
        password,
        employee_code: employeeCode || null,
      }),
    onSuccess: () => {
      toast.success("Регистрация успешна! Войдите в систему.");
      navigate("/login");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white mb-4 shadow-lg shadow-brand-500/25">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold">MedPayroll</h1>
        </div>

        <div className="card p-8 shadow-xl">
          <h2 className="text-xl font-display font-semibold mb-6">
            Регистрация
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="username"
                required
              />
              <p className="text-xs text-slate-400">
                Только строчные латинские буквы и цифры, от 3 символов
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-slate-400">Минимум 8 символов</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Код сотрудника{" "}
                <span className="text-slate-400">(опционально)</span>
              </label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                className="input-field"
                placeholder="EMP-a1b2c3d4"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full"
            >
              <UserPlus className="w-4 h-4" />
              {mutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
