"use client";

import { useState } from "react";

export function CopyRulesButton({ rules }: { rules: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rules);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy rules:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="btn-secondary text-sm"
      type="button"
    >
      {copied ? "✓ Copied!" : "📋 Copy Rules"}
    </button>
  );
}
