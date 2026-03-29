import {
  Users,
  Building2,
  Briefcase,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatCard, RoleGuard } from "@/shared/ui";
import { UserRole } from "@/shared/types";
import { useAuthStore } from "@/stores/auth";
import { UserRoleLabel } from "@/shared/types";
import { formatMoney } from "@/shared/utils";

const monthlyData = [
  { month: "Янв", accruals: 2450000, deductions: 380000 },
  { month: "Фев", accruals: 2520000, deductions: 395000 },
  { month: "Мар", accruals: 2680000, deductions: 420000 },
  { month: "Апр", accruals: 2550000, deductions: 400000 },
  { month: "Май", accruals: 2700000, deductions: 430000 },
  { month: "Июн", accruals: 2850000, deductions: 445000 },
];

const departmentData = [
  { name: "Терапия", value: 35 },
  { name: "Хирургия", value: 25 },
  { name: "Педиатрия", value: 20 },
  { name: "Неврология", value: 12 },
  { name: "Прочие", value: 8 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">
          Добро пожаловать{user ? `, ${user.username}` : ""}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {user ? `Роль: ${UserRoleLabel[user.role]}` : ""} · Обзор системы
          начисления зарплаты
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Сотрудников"
          value="127"
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          trend="+3 за месяц"
        />
        <StatCard
          title="Отделений"
          value="8"
          icon={
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          }
        />
        <StatCard
          title="Должностей"
          value="24"
          icon={
            <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          }
        />
        <StatCard
          title="Расч. листов"
          value="342"
          icon={
            <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          }
          trend="54 в этом месяце"
        />
      </div>

      <RoleGuard minRole={UserRole.ACCOUNTANT}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-display font-semibold mb-4">
              Динамика начислений и удержаний
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border-light dark:stroke-border-dark"
                />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}М`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "var(--tw-bg-opacity, 1) ? #1e293b : #f8fafc",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => formatMoney(value)}
                />
                <Bar
                  dataKey="accruals"
                  name="Начисления"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="deductions"
                  name="Удержания"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold mb-4">
              Сотрудники по отделениям
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {departmentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-500">Начислено (июнь)</span>
            </div>
            <p className="text-2xl font-display font-bold">
              {formatMoney(2850000)}
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5 text-red-600" />
              </div>
              <span className="text-sm text-slate-500">Удержано (июнь)</span>
            </div>
            <p className="text-2xl font-display font-bold">
              {formatMoney(445000)}
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-500">К выплате (июнь)</span>
            </div>
            <p className="text-2xl font-display font-bold">
              {formatMoney(2405000)}
            </p>
          </div>
        </div>
      </RoleGuard>

      {user?.role === UserRole.EMPLOYEE && (
        <div className="card p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">
            Личный кабинет
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Для просмотра вашего расчётного листа перейдите в раздел «Отчёты» и
            выберите отчёт по сотруднику.
          </p>
        </div>
      )}
    </div>
  );
}
