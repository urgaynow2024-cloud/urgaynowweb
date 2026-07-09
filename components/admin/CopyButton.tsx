"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "./ui/icons";

export function CopyButton({
  text,
  label = "Copy",
  className = "btn-secondary btn-sm",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
      {copied ? "Copied!" : label}
    </button>
  );
}
