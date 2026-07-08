"use client";

import { useState } from "react";

export type RuleEntry = {
  id: string;
  category: string;
  title: string;
  content: string;
  sortOrder: number;
  error?: string;
};

export function BulkRuleEditor({
  initialRules = [],
  onSave,
  saving = false,
}: {
  initialRules?: RuleEntry[];
  onSave: (rules: RuleEntry[]) => void;
  saving?: boolean;
}) {
  const [rules, setRules] = useState<RuleEntry[]>(
    initialRules.length > 0
      ? initialRules
      : [{ id: crypto.randomUUID(), category: "General", title: "", content: "", sortOrder: 0 }]
  );
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const addRule = () => {
    const maxSort = Math.max(...rules.map((r) => r.sortOrder), 0);
    setRules([
      ...rules,
      {
        id: crypto.randomUUID(),
        category: "General",
        title: "",
        content: "",
        sortOrder: maxSort + 1,
      },
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length === 1) return;
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, field: keyof RuleEntry, value: string | number) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, [field]: value, error: undefined } : r))
    );
  };

  const moveRule = (index: number, direction: "up" | "down") => {
    const newRules = [...rules];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newRules.length) return;

    // Swap
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    
    // Update sort orders
    newRules.forEach((r, i) => {
      r.sortOrder = i;
    });
    
    setRules(newRules);
  };

  const handlePaste = () => {
    const lines = pasteText.split("\n").filter((line) => line.trim());
    const newRules: RuleEntry[] = lines.map((line, i) => ({
      id: crypto.randomUUID(),
      category: "General",
      title: line.trim(),
      content: "",
      sortOrder: rules.length + i,
    }));
    setRules([...rules, ...newRules]);
    setShowPasteModal(false);
    setPasteText("");
  };

  const handleSave = () => {
    // Validate
    const validatedRules = rules.map((r) => {
      const errors: string[] = [];
      if (!r.title.trim()) errors.push("Title is required");
      if (!r.content.trim()) errors.push("Details are required");
      return { ...r, error: errors.join(", ") };
    });

    const hasErrors = validatedRules.some((r) => r.error);
    if (hasErrors) {
      setRules(validatedRules);
      return;
    }

    onSave(validatedRules);
  };

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRule}
          className="btn-secondary"
        >
          + Add Rule
        </button>
        <button
          type="button"
          onClick={() => setShowPasteModal(true)}
          className="btn-secondary"
        >
          📋 Paste Multiple Rules
        </button>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className={`card relative transition-all duration-200 ${
              rule.error ? "border-red-300 dark:border-red-800" : ""
            }`}
          >
            {/* Reorder controls */}
            <div className="absolute left-2 top-2 flex flex-col gap-1 lg:left-3 lg:top-3">
              <button
                type="button"
                onClick={() => moveRule(index, "up")}
                disabled={index === 0}
                className="rounded bg-zinc-100 p-1 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveRule(index, "down")}
                disabled={index === rules.length - 1}
                className="rounded bg-zinc-100 p-1 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                aria-label="Move down"
              >
                ↓
              </button>
            </div>

            {/* Rule content */}
            <div className="pl-10 lg:pl-16">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor={`category-${rule.id}`}>
                    Category
                  </label>
                  <input
                    id={`category-${rule.id}`}
                    type="text"
                    className="input"
                    value={rule.category}
                    onChange={(e) => updateRule(rule.id, "category", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`title-${rule.id}`}>
                    Title *
                  </label>
                  <input
                    id={`title-${rule.id}`}
                    type="text"
                    className="input"
                    value={rule.title}
                    onChange={(e) => updateRule(rule.id, "title", e.target.value)}
                    placeholder="Rule title"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="label" htmlFor={`content-${rule.id}`}>
                  Details (Markdown) *
                </label>
                <textarea
                  id={`content-${rule.id}`}
                  rows={4}
                  className="input font-mono text-sm"
                  value={rule.content}
                  onChange={(e) => updateRule(rule.id, "content", e.target.value)}
                  placeholder="Rule details..."
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Order: {rule.sortOrder}
                </div>
                {rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
              {rule.error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{rule.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full sm:w-auto"
      >
        {saving ? "Saving..." : `Save ${rules.length} Rule${rules.length !== 1 ? "s" : ""}`}
      </button>

      {/* Paste modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              Paste Multiple Rules
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Paste one rule per line. Each line will become a new rule title.
            </p>
            <textarea
              rows={10}
              className="input font-mono text-sm mb-4"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Rule 1&#10;Rule 2&#10;Rule 3"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPasteModal(false);
                  setPasteText("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaste}
                className="btn-primary"
              >
                Add Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
