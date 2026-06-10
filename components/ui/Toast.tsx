"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastData {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

let addToastFn: ((toast: Omit<ToastData, "id">) => void) | null = null;

export function showToast(toast: Omit<ToastData, "id">) {
  addToastFn?.(toast);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle size={16} className="text-teal" />,
    error: <AlertCircle size={16} className="text-red" />,
    info: <Info size={16} className="text-cyan" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 px-4 py-3 bg-ink-3 border border-border rounded-card text-sm text-text page-enter min-w-[280px]"
        >
          {icons[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-text-faint hover:text-text"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
