import { useAuthStore } from "@/stores/auth";
import type { UserRole } from "@/shared/types";

interface Props {
  minRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ minRole, children, fallback = null }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role < minRole) return <>{fallback}</>;
  return <>{children}</>;
}
