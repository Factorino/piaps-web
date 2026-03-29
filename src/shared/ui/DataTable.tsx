import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortParam } from "@/shared/types";

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  sort?: SortParam[];
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  sort = [],
  onSort,
  onRowClick,
  isLoading,
}: Props<T>) {
  const getSortIcon = (field: string) => {
    const s = sort.find((p) => p.field === field);
    if (!s) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return s.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200" : ""} ${col.className || ""}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.title}
                  {col.sortable && getSortIcon(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  Загрузка...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-slate-400"
              >
                Нет данных для отображения
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={String(item[keyField])}
                className={`border-b border-border-light/50 dark:border-border-dark/50 transition-colors ${onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(item)
                      : String(
                          (item as Record<string, unknown>)[col.key] ?? "—",
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
