"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";
type Toast = { id: string; type: ToastType; title: string; message?: string };

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
} | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${toastId++}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.addToast;
}

const toastIcons: Record<ToastType, ReactNode> = {
  success: "💜",
  error: "⚠️",
  info: "🐾",
  warning: "✨",
};

const toastColors: Record<ToastType, string> = {
  success: "from-emerald-500 to-emerald-600",
  error: "from-red-500 to-red-600",
  info: "from-brand-500 to-brand-600",
  warning: "from-amber-500 to-amber-600",
};

function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-direction-column gap-3">
      {ctx.toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 rounded-2xl border border-white/20 bg-ink-900/90 px-4 py-3 text-sm shadow-lg shadow-black/30 backdrop-blur-xl animate-scale-in`}
        >
          <span className="text-lg">{toastIcons[toast.type]}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{toast.title}</p>
            {toast.message && (
              <p className="mt-0.5 text-sm text-ink-300">{toast.message}</p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-lg bg-gradient-to-r ${toastColors[toast.type]} w-1.5 h-1.5`}
            aria-hidden
          />
        </div>
      ))}
    </div>
  );
}
