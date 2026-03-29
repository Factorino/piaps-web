import { Filter, X } from "lucide-react";
import { useState } from "react";
import type { FilterParam } from "@/shared/types";

export interface FilterConfig {
  field: string;
  label: string;
  type: "select" | "text" | "date";
  options?: { value: string; label: string }[];
  operator?: string;
  /** When set to 'number', the selected value will be cast to Number before emitting */
  valueType?: "string" | "number";
}

interface Props {
  configs: FilterConfig[];
  active: FilterParam[];
  onAdd: (f: FilterParam) => void;
  onRemove: (field: string) => void;
  onClear: () => void;
}

export function FilterPanel({
  configs,
  active,
  onAdd,
  onRemove,
  onClear,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-ghost btn-sm ${active.length > 0 ? "text-brand-600 dark:text-brand-400" : ""}`}
      >
        <Filter className="w-4 h-4" />
        Фильтры
        {active.length > 0 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
            {active.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 card p-4 shadow-xl z-40 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Фильтры</span>
            {active.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Сбросить
              </button>
            )}
          </div>

          {configs.map((cfg) => {
            const activeFilter = active.find((f) => f.field === cfg.field);
            return (
              <div key={cfg.field} className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  {cfg.label}
                </label>
                {cfg.type === "select" && cfg.options ? (
                  <select
                    value={String(activeFilter?.value ?? "")}
                    onChange={(e) => {
                      if (e.target.value) {
                        const raw = e.target.value;
                        const parsed =
                          cfg.valueType === "number" ? Number(raw) : raw;
                        onAdd({
                          field: cfg.field,
                          operator: cfg.operator || "eq",
                          value: parsed,
                        });
                      } else {
                        onRemove(cfg.field);
                      }
                    }}
                    className="input-field text-xs py-1.5"
                  >
                    <option value="">Все</option>
                    {cfg.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : cfg.type === "date" ? (
                  <input
                    type="date"
                    value={(activeFilter?.value as string) || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        onAdd({
                          field: cfg.field,
                          operator: cfg.operator || "eq",
                          value: e.target.value,
                        });
                      } else {
                        onRemove(cfg.field);
                      }
                    }}
                    className="input-field text-xs py-1.5"
                  />
                ) : (
                  <input
                    type="text"
                    value={(activeFilter?.value as string) || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        onAdd({
                          field: cfg.field,
                          operator: cfg.operator || "ilike",
                          value: `%${e.target.value}%`,
                        });
                      } else {
                        onRemove(cfg.field);
                      }
                    }}
                    placeholder={`Фильтр по ${cfg.label.toLowerCase()}`}
                    className="input-field text-xs py-1.5"
                  />
                )}
              </div>
            );
          })}

          {active.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-light dark:border-border-dark">
              {active.map((f) => {
                const cfg = configs.find((c) => c.field === f.field);
                return (
                  <span
                    key={f.field}
                    className="badge-blue flex items-center gap-1"
                  >
                    {cfg?.label}: {String(f.value).replace(/%/g, "")}
                    <button onClick={() => onRemove(f.field)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
