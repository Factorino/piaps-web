import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message = "Вы уверены?",
  confirmText = "Удалить",
  isLoading,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={isLoading}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Удаление..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
