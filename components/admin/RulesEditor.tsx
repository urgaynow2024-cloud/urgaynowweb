"use client";

import { useState } from "react";
import { BulkRuleEditor, type RuleEntry } from "@/components/admin/BulkRuleEditor";
import { bulkSaveRules } from "@/app/admin/rules/actions";

export function RulesEditor({ initial }: { initial: RuleEntry[] }) {
  const [saving, setSaving] = useState(false);
  return (
    <BulkRuleEditor
      initialRules={initial}
      saving={saving}
      onSave={async (rules: RuleEntry[]) => {
        setSaving(true);
        // bulkSaveRules redirects on success; do not swallow the redirect.
        await bulkSaveRules(JSON.stringify(rules));
      }}
    />
  );
}
