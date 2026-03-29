interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = "brand",
}: Props) {
  return (
    <div className="card p-5 flex items-start gap-4">
      {icon && (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>
        <p className="text-xl font-display font-bold mt-0.5">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
