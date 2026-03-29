import { PayrollStatus, PayrollStatusLabel } from "@/shared/types";

const statusClasses: Record<PayrollStatus, string> = {
  [PayrollStatus.DRAFT]: "badge-yellow",
  [PayrollStatus.CONFIRMED]: "badge-green",
  [PayrollStatus.CANCELLED]: "badge-red",
};

export function StatusBadge({ status }: { status: PayrollStatus }) {
  return (
    <span className={statusClasses[status]}>{PayrollStatusLabel[status]}</span>
  );
}
