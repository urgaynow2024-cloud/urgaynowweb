"use client";

import type { FormEventHandler } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  label?: string;
  className?: string;
};

export function ConfirmDeleteButton({
  action,
  message,
  label = "Delete",
  className = "btn-danger text-sm",
}: Props) {
  const handleClick: FormEventHandler<HTMLButtonElement> = (e) => {
    if (!confirm(message)) e.preventDefault();
  };

  return (
    <form action={action}>
      <button type="submit" className={className} onClick={handleClick}>
        {label}
      </button>
    </form>
  );
}
