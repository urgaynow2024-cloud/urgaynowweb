"use client";

import { useRef, useState } from "react";
import { Markdown } from "@/components/Markdown";
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconDownload,
  IconUpload,
  IconGrip,
  IconCheck,
  IconX,
  IconSparkles,
  IconLayers,
} from "@/components/admin/ui/icons";

export type RuleEntry = {
  id: string;
  category: string;
  title: string;
  content: string;
  sortOrder: number;
  error?: string;
};

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

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
      : [{ id: newId(), category: "General", title: "", content: "", sortOrder: 0 }],
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(id: string, field: keyof RuleEntry, value: string | number) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value, error: undefined } : r)));
  }

  function addRule() {
    setRules((prev) => [
      ...prev,
      { id: newId(), category: "General", title: "", content: "", sortOrder: prev.length },
    ]);
  }

  function duplicateRule(id: string) {
    setRules((prev) => {
      const i = prev.findIndex((r) => r.id === id);
      if (i === -1) return prev;
      const copy = { ...prev[i], id: newId(), title: `${prev[i].title} (copy)` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next.map((r, idx) => ({ ...r, sortOrder: idx }));
    });
  }

  function removeRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id).map((r, idx) => ({ ...r, sortOrder: idx })));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    setRules((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((r, idx) => ({ ...r, sortOrder: idx }));
    });
  }

  function handleImport() {
    const text = importText.trim();
    if (!text) return;
    let parsed: RuleEntry[] = [];
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        parsed = json.map((r: any, i: number) => ({
          id: newId(),
          category: String(r.category || "General"),
          title: String(r.title || ""),
          content: String(r.content || ""),
          sortOrder: i,
        }));
      }
    } catch {
      parsed = text.split("\n").filter((l) => l.trim()).map((l, i) => ({
        id: newId(),
        category: "General",
        title: l.trim(),
        content: "",
        sortOrder: i,
      }));
    }
    if (parsed.length) setRules(parsed);
    setImportOpen(false);
    setImportText("");
  }

  async function handleFileDrop(file: File) {
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".json")) {
      alert("Please drop a .txt or .json file.");
      return;
    }
    const text = await file.text();
    await parseAndSetRules(text);
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".json")) {
      alert("Please select a .txt or .json file.");
      return;
    }
    const text = await file.text();
    await parseAndSetRules(text);
    e.target.value = "";
  }

  async function parseAndSetRules(text: string) {
    let parsed: RuleEntry[] = [];
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        parsed = json.map((r: any, i: number) => ({
          id: newId(),
          category: String(r.category || "General"),
          title: String(r.title || ""),
          content: String(r.content || ""),
          sortOrder: i,
        }));
      }
    } catch {
      parsed = text.split("\n").filter((l) => l.trim()).map((l, i) => ({
        id: newId(),
        category: "General",
        title: l.trim(),
        content: "",
        sortOrder: i,
      }));
    }
    if (parsed.length) setRules(parsed);
  }

  function handleExport() {
    const data = rules.map(({ category, title, content, sortOrder }) => ({ category, title, content, sortOrder }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "community-rules.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyAll() {
    const grouped = rules.reduce<Record<string, RuleEntry[]>>((acc, r) => {
      (acc[r.category] ||= []).push(r);
      return acc;
    }, {});
    const md = Object.entries(grouped)
      .map(([cat, rs]) => `## ${cat}\n\n` + rs.map((r) => `### ${r.title}\n${r.content}`).join("\n\n"))
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  function handleSave() {
    const validated = rules.map((r) => {
      const errs: string[] = [];
      if (!r.title.trim()) errs.push("Title required");
      if (!r.content.trim()) errs.push("Details required");
      return { ...r, error: errs.join(" · ") };
    });
    if (validated.some((r) => r.error)) {
      setRules(validated);
      return;
    }
    onSave(validated);
  }

  return (
    <div
      className="space-y-5"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileDrop(file);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.json"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={addRule} className="btn-primary btn-sm">
          <IconPlus size={15} /> Add rule
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary btn-sm"
        >
          <IconUpload size={15} /> Import file
        </button>
        <button type="button" onClick={() => setImportOpen(true)} className="btn-secondary btn-sm">
          <IconUpload size={15} /> Import text
        </button>
        <button type="button" onClick={handleExport} className="btn-secondary btn-sm">
          <IconDownload size={15} /> Export
        </button>
        <button type="button" onClick={handleCopyAll} className="btn-ghost btn-sm">
          {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
          {copied ? "Copied!" : "Copy all"}
        </button>
        <span className="ml-auto badge badge-neutral">{rules.length} rules</span>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileDrop(file);
        }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-brand-400 bg-brand-50/80 dark:border-brand-500 dark:bg-brand-900/30"
            : "border-ink-200 bg-ink-50/40 hover:border-brand-300 dark:border-ink-700 dark:bg-ink-800/30 dark:hover:border-brand-500"
        }`}
      >
        <p className="text-lg font-semibold text-ink-700 dark:text-ink-200">
          {dragOver ? "Drop to import rules" : "Drag & drop a .txt or .json file here to import rules"}
        </p>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          One rule per line, or a JSON array of rules — or click to browse
        </p>
      </div>

      {/* Rule cards */}
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              setDragIndex(index);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOverIndex(index);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              if (dragIndex !== null && overIndex !== null) reorder(dragIndex, overIndex);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`card overflow-visible transition-all duration-200 ${
              overIndex === index && dragIndex !== null && dragIndex !== index ? "ring-2 ring-brand-400" : ""
            } ${rule.error ? "border-red-300 dark:border-red-800" : ""}`}
          >
            <div className="flex items-start gap-3 p-4">
              <span
                className="mt-1 cursor-grab text-ink-300 transition-colors hover:text-ink-500 active:cursor-grabbing dark:text-ink-600"
                title="Drag to reorder"
              >
                <IconGrip size={20} />
              </span>
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor={`cat-${rule.id}`}>Category</label>
                    <input id={`cat-${rule.id}`} className="input" value={rule.category} onChange={(e) => update(rule.id, "category", e.target.value)} placeholder="General" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`title-${rule.id}`}>Title *</label>
                    <input id={`title-${rule.id}`} className="input" value={rule.title} onChange={(e) => update(rule.id, "title", e.target.value)} placeholder="Rule title" />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor={`content-${rule.id}`}>Details (Markdown) *</label>
                    <textarea
                      id={`content-${rule.id}`}
                      rows={6}
                      className="textarea font-mono text-sm"
                      value={rule.content}
                      onChange={(e) => update(rule.id, "content", e.target.value)}
                      placeholder="Rule details in **Markdown**…"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      <IconSparkles size={14} /> Live preview
                    </label>
                    <div className="h-[148px] overflow-y-auto rounded-xl border border-ink-200 bg-ink-50/60 p-3 text-sm dark:border-ink-700 dark:bg-ink-800/40">
                      {rule.content.trim() ? (
                        <Markdown content={rule.content} />
                      ) : (
                        <p className="text-ink-400">Preview appears as you type…</p>
                      )}
                    </div>
                  </div>
                </div>

                {rule.error && <p className="field-error mt-2">{rule.error}</p>}
              </div>

              <div className="flex shrink-0 flex-col gap-1.5">
                <button type="button" onClick={() => duplicateRule(rule.id)} className="btn-icon" title="Duplicate" aria-label="Duplicate">
                  <IconCopy size={16} />
                </button>
                <button type="button" onClick={() => removeRule(rule.id)} className="btn-icon hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" title="Delete" aria-label="Delete" disabled={rules.length === 1}>
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white/90 p-3 shadow-card-hover backdrop-blur dark:border-ink-700 dark:bg-ink-900/90">
        <p className="hidden text-sm text-ink-500 dark:text-ink-400 sm:block">
          <IconLayers size={14} className="mr-1 inline" /> {rules.length} rules · drag cards to reorder
        </p>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary ml-auto">
          {saving ? "Saving…" : `Save ${rules.length} rule${rules.length !== 1 ? "s" : ""}`}
        </button>
      </div>

      {/* Import modal */}
      {importOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={() => setImportOpen(false)} />
          <div className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-ink-200 bg-white p-6 shadow-card-hover dark:border-ink-700 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-white">Import rules</h3>
              <button type="button" onClick={() => setImportOpen(false)} className="btn-icon"><IconX size={18} /></button>
            </div>
            <p className="mb-3 text-sm text-ink-500 dark:text-ink-400">
              Paste a JSON array <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">[{"{"}title, content, category{"}"}]</code> or one rule title per line.
            </p>
            <textarea
              rows={9}
              className="textarea font-mono text-sm"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste a JSON array of rules to import"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setImportOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={handleImport} className="btn-primary">Import rules</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
