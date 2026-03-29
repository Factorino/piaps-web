import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/shared/types";

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function Pagination({ meta, onPageChange, onPageSizeChange }: Props) {
  const { page, page_size, total, total_pages, has_prev, has_next } = meta;
  const from = (page - 1) * page_size + 1;
  const to = Math.min(page * page_size, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <div className="flex items-center gap-4">
        <span className="text-slate-500 dark:text-slate-400">
          {from}–{to} из {total}
        </span>
        {onPageSizeChange && (
          <select
            value={page_size}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="input-field w-auto py-1.5 px-2 text-xs"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} / стр.
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={!has_prev}
          onClick={() => onPageChange(page - 1)}
          className="btn-ghost btn-icon btn-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {generatePageNumbers(page, total_pages).map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`btn-sm min-w-[32px] rounded-lg text-xs font-medium ${
                p === page ? "bg-brand-600 text-white" : "btn-ghost"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          disabled={!has_next}
          onClick={() => onPageChange(page + 1)}
          className="btn-ghost btn-icon btn-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
