"use client";

import { useState } from "react";
import { ConfirmDialog } from "./ui/Dialog";
import { IconTrash } from "./ui/icons";

export function ConfirmDeleteButton({
  action,
  message,
  label = "Delete",
  confirmLabel = "Delete",
  className = "btn-danger text-sm",
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await action(new FormData());
    } catch {
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <span className="flex items-center gap-1.5">
          <IconTrash size={15} />
          {label}
        </span>
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Delete item?"
        message={message}
        confirmLabel={confirmLabel}
        loading={loading}
      />
    </>
  );
}
