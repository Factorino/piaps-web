import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortParam } from "@/shared/types";

interface Props {
  field: string;
  label: string;
  sort: SortParam[];
  onToggle: (field: string) => void;
}

export function SortButton({ field, label, sort, onToggle }: Props) {
  const current = sort.find((s) => s.field === field);
  const Icon = !current
    ? ArrowUpDown
    : current.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <button
      onClick={() => onToggle(field)}
      className={`btn-sm btn-ghost ${current ? "text-brand-600 dark:text-brand-400" : ""}`}
    >
      {label}
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
