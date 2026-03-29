import { Inbox } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Нет данных",
  description,
  icon,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon || (
        <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600" />
      )}
      <h3 className="font-medium text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
