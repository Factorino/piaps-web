import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { UserRole } from "@/shared/types";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { ProfilePage } from "@/features/auth/components/ProfilePage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { DepartmentsList } from "@/features/departments/components/DepartmentsList";
import { PositionsList } from "@/features/positions/components/PositionsList";
import { EmployeesList } from "@/features/employees/components/EmployeesList";
import { PayrollItemsList } from "@/features/payroll-items/components/PayrollItemsList";
import { PayrollSheetsList } from "@/features/payroll-sheets/components/PayrollSheetsList";
import { UsersList } from "@/features/users/components/UsersList";
import { ReportsPage } from "@/features/reports/components/ReportsPage";

function ProtectedRoute({
  children,
  minRole,
}: {
  children: React.ReactNode;
  minRole?: UserRole;
}) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (minRole !== undefined && (user?.role ?? -1) < minRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterForm />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="departments"
          element={
            <ProtectedRoute minRole={UserRole.ACCOUNTANT}>
              <DepartmentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="positions"
          element={
            <ProtectedRoute minRole={UserRole.ACCOUNTANT}>
              <PositionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute minRole={UserRole.ACCOUNTANT}>
              <EmployeesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="payroll-items"
          element={
            <ProtectedRoute minRole={UserRole.ACCOUNTANT}>
              <PayrollItemsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="payroll-sheets"
          element={
            <ProtectedRoute minRole={UserRole.ACCOUNTANT}>
              <PayrollSheetsList />
            </ProtectedRoute>
          }
        />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute minRole={UserRole.ADMINISTRATOR}>
              <UsersList />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
