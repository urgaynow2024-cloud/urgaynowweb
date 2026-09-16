"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { IconX } from "@/components/admin/ui/icons";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shared-modal-title"
        className={cn(
          "relative w-full max-w-lg animate-scale-in rounded-2xl border border-ink-200 bg-white p-6 shadow-card-hover dark:border-ink-700 dark:bg-ink-900",
          className,
        )}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="btn-icon absolute right-3 top-3">
          <IconX size={18} />
        </button>
        <h2 id="shared-modal-title" className="text-lg font-semibold text-ink-900 dark:text-white">
          {title}
        </h2>
        {description && <div className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{description}</div>}
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
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
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  const confirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-600 dark:text-ink-300">{message}</p>
    </Modal>
  );
}
