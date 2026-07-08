"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";
import { IconAlert, IconX } from "./icons";

export function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md animate-scale-in rounded-2xl border border-ink-200 bg-white p-6 shadow-card-hover dark:border-ink-700 dark:bg-ink-900"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="btn-icon absolute right-3 top-3">
          <IconX size={18} />
        </button>
        <div className="flex items-start gap-4">
          {icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h2>
            {description && <div className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{description}</div>}
          </div>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      icon={<IconAlert size={22} />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="mt-4 text-sm text-ink-600 dark:text-ink-300">{message}</p>
    </Dialog>
  );
}
