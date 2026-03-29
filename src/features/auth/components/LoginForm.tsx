import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogIn, Eye, EyeOff, Stethoscope } from "lucide-react";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);

  const mutation = useMutation({
    mutationFn: () => authApi.login(username, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token, data.user);
      toast.success("Добро пожаловать!");
      navigate("/");
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
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Система начисления зарплаты
          </p>
        </div>

        <div className="card p-8 shadow-xl">
          <h2 className="text-xl font-display font-semibold mb-6">
            Вход в систему
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
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !username || !password}
              className="btn-primary w-full"
            >
              {mutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {mutation.isPending ? "Вход..." : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Регистрация
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
