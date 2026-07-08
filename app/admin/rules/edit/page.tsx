"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BulkRuleEditor, type RuleEntry } from "@/components/admin/BulkRuleEditor";
import { bulkSaveRules } from "../actions";

export default function BulkEditRulesPage() {
  const router = useRouter();
  const [initialRules, setInitialRules] = useState<RuleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch existing rules
    fetch("/api/admin/rules")
      .then((res) => res.json())
      .then((data) => {
        setInitialRules(
          data.map((r: any) => ({
            id: r.id,
            category: r.category,
            title: r.title,
            content: r.content,
            sortOrder: r.sortOrder,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (rules: RuleEntry[]) => {
    setSaving(true);
    try {
      await bulkSaveRules(JSON.stringify(rules));
    } catch (error) {
      console.error("Failed to save rules:", error);
      alert("Failed to save rules. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading rules...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Edit Rules
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Add, edit, reorder, and manage all community rules in one place.
        </p>
      </div>
      
      <div className="card">
        <BulkRuleEditor initialRules={initialRules} onSave={handleSave} saving={saving} />
      </div>
    </div>
  );
}
