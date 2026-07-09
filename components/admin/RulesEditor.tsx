"use client";

import { useState, useTransition } from "react";
import { BulkRuleEditor, type RuleEntry } from "@/components/admin/BulkRuleEditor";
import { bulkSaveRules } from "@/app/admin/rules/actions";

export function RulesEditor({ initial }: { initial: RuleEntry[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <BulkRuleEditor
      initialRules={initial}
      saving={pending}
      onSave={async (rules: RuleEntry[]) => {
        // bulkSaveRules redirects on success; do not swallow the redirect.
        startTransition(() => {
          bulkSaveRules(JSON.stringify(rules));
        });
      }}
    />
  );
}
