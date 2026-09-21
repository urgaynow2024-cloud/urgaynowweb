"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { IconPalette, IconCalendar, IconEye, IconPlus, IconTrash, IconSun, IconMoon, IconEdit } from "@/components/admin/ui/icons";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { getAllThemes, THEME_REGISTRY, type ThemeDefinition } from "@/lib/themes";

interface ScheduleFormData {
  id?: string;
  themeId: string;
  start: string;
  end: string;
  enabled: boolean;
  priority: number;
}

interface AppearancePageProps {
  initial: {
    mode: "MANUAL" | "AUTOMATIC";
    manualThemeId: string;
    schedules: Array<{ id: string; themeId: string; start: string; end: string; enabled: boolean; priority: number }>;
    themes: ThemeDefinition[];
  };
  saved?: string;
  error?: string;
}

export default function AppearancePage({ initial, saved, error }: AppearancePageProps) {
  const [activeTab, setActiveTab] = useState<"themes" | "schedules">("themes");
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleFormData | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const currentTheme = THEME_REGISTRY[initial.manualThemeId] || THEME_REGISTRY.default;
  const activeSchedule = initial.schedules.find((s) => s.enabled && new Date(s.start) <= new Date() && new Date(s.end) >= new Date());

  const handlePreview = (themeId: string) => {
    setPreviewThemeId(themeId);
    document.documentElement.setAttribute("data-site-theme", themeId);
  };

  const clearPreview = () => {
    setPreviewThemeId(null);
    const actualThemeId = activeSchedule?.themeId || initial.manualThemeId;
    document.documentElement.setAttribute("data-site-theme", actualThemeId);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Settings saved
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error === "missing_fields" ? "Please fill in all required fields." : "An error occurred."}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 rounded-xl p-1" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "themes"}
          onClick={() => setActiveTab("themes")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "themes"
              ? "bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-white"
              : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-white"
          }`}
        >
          <IconPalette size={16} className="inline mr-1" /> Themes
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "schedules"}
          onClick={() => setActiveTab("schedules")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "schedules"
              ? "bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-white"
              : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-white"
          }`}
        >
          <IconCalendar size={16} className="inline mr-1" /> Schedules
        </button>
      </div>

      {/* Themes Tab */}
      {activeTab === "themes" && (
        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader
              title="Active Theme"
              icon={<IconPalette size={18} />}
              subtitle={
                <div className="flex items-center gap-3 mt-2">
                  <Badge tone={initial.mode === "MANUAL" ? "brand" : "success"}>{initial.mode}</Badge>
                  {initial.mode === "AUTOMATIC" && activeSchedule && (
                    <Badge tone="neutral">
                      Currently: {THEME_REGISTRY[activeSchedule.themeId]?.name || activeSchedule.themeId}
                    </Badge>
                  )}
                </div>
              }
            />
            <CardBody>
              <form action="/admin/settings/appearance/update-theme" method="post" className="space-y-4">
                <input type="hidden" name="mode" value={initial.mode} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="field-label" htmlFor="mode">Activation Mode</label>
                    <select
                      id="mode"
                      name="mode"
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className="select"
                    >
                      <option value="MANUAL" selected={initial.mode === "MANUAL"}>Manual — pick a theme</option>
                      <option value="AUTOMATIC" selected={initial.mode === "AUTOMATIC"}>Automatic — use schedules</option>
                    </select>
                  </div>
                  {initial.mode === "MANUAL" && (
                    <div>
                      <label className="field-label" htmlFor="manualThemeId">Manual Theme</label>
                      <select
                        id="manualThemeId"
                        name="manualThemeId"
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="select"
                      >
                        {initial.themes.map((t) => (
                          <option key={t.id} value={t.id} selected={initial.manualThemeId === t.id}>
                            {t.icon} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="sm:col-span-3 flex items-end">
                    <button type="submit" className="btn-primary">
                      Save Mode & Theme
                    </button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader
              title="Theme Gallery"
              icon={<IconPalette size={18} />}
              subtitle="Click Preview to see a theme temporarily. Previews are session-only and don't affect visitors."
            />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {initial.themes.map((theme) => (
                  <ThemePreviewCard
                    key={theme.id}
                    theme={theme}
                    isActive={initial.manualThemeId === theme.id && initial.mode === "MANUAL"}
                    isScheduledActive={activeSchedule?.themeId === theme.id && initial.mode === "AUTOMATIC"}
                    previewThemeId={previewThemeId}
                    onPreview={handlePreview}
                    onClearPreview={clearPreview}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader
              title="Automatic Schedules"
              icon={<IconCalendar size={18} />}
              subtitle="Define date ranges for automatic theme activation. Lower priority number = higher precedence. Manual mode overrides all schedules."
            />
            <CardBody>
              {showScheduleForm && (
                <ScheduleForm
                  initial={editingSchedule || { themeId: "", start: "", end: "", enabled: true, priority: 0 }}
                  onCancel={() => { setEditingSchedule(null); setShowScheduleForm(false); }}
                  onSubmit={(data) => {
                    // Submit via form
                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = "/admin/settings/appearance/update-schedule";
                    for (const [key, value] of Object.entries(data)) {
                      const input = document.createElement("input");
                      input.type = "hidden";
                      input.name = key;
                      input.value = String(value);
                      form.appendChild(input);
                    }
                    document.body.appendChild(form);
                    form.submit();
                  }}
                />
              )}

              {!showScheduleForm && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => { setEditingSchedule(null); setShowScheduleForm(true); }}
                    className="btn-primary"
                  >
                    <IconPlus size={16} className="mr-1" /> Add Schedule
                  </button>
                </div>
              )}

              {initial.schedules.length === 0 && !showScheduleForm ? (
                <div className="text-center py-8 text-ink-500 dark:text-ink-400">
                  <IconCalendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No schedules configured. Click &quot;Add Schedule&quot; to create one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {initial.schedules
                    .slice()
                    .sort((a, b) => a.priority - b.priority)
                    .map((schedule) => (
                      <ScheduleRow
                        key={schedule.id}
                        schedule={schedule}
                        theme={THEME_REGISTRY[schedule.themeId]}
                        isActive={schedule.enabled && new Date(schedule.start) <= new Date() && new Date(schedule.end) >= new Date()}
                        onEdit={() => { setEditingSchedule(schedule); setShowScheduleForm(true); }}
                        onDelete={() => {
                          const form = document.createElement("form");
                          form.method = "POST";
                          form.action = `/admin/settings/appearance/delete-schedule/${schedule.id}`;
                          document.body.appendChild(form);
                          form.submit();
                        }}
                      />
                    ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function ThemePreviewCard({
  theme,
  isActive,
  isScheduledActive,
  previewThemeId,
  onPreview,
  onClearPreview,
}: {
  theme: ThemeDefinition;
  isActive: boolean;
  isScheduledActive: boolean;
  previewThemeId: string | null;
  onPreview: (themeId: string) => void;
  onClearPreview: () => void;
}) {
  const isPreviewed = previewThemeId === theme.id;
  const isActiveOverall = isActive || isScheduledActive;

  return (
    <div
      className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isActiveOverall
          ? "border-brand-400 dark:border-brand-500 shadow-lg shadow-brand-500/10 dark:shadow-brand-500/20"
          : "border-ink-200 dark:border-ink-700"
      } ${isPreviewed ? "ring-4 ring-brand-300 dark:ring-brand-600" : ""}`}
      style={{ background: theme.previewGradient }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      <div className="relative p-5 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl">{theme.icon}</span>
            <h3 className="mt-1 font-bold text-white text-lg">{theme.name}</h3>
            <p className="mt-0.5 text-white/80 text-xs">{theme.description}</p>
          </div>
          {(isActive || isScheduledActive) && (
            <Badge tone="success" className="text-xs">
              {isActive ? "Active" : "Scheduled Active"}
            </Badge>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex gap-1.5" role="img" aria-label="Color palette">
            {[
              theme.variables.brand,
              theme.variables.brandSoft.replace("rgba(", "").replace(")", "").split(",")[0],
              theme.variables.background,
              theme.variables.surface,
              theme.variables.text,
            ].slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-white/30 flex-shrink-0"
                style={{ backgroundColor: color }}
                title={`Color ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => isPreviewed ? onClearPreview() : onPreview(theme.id)}
              className={`flex-1 btn-sm ${isPreviewed ? "btn-danger" : "btn-secondary"}`}
            >
              <IconEye size={12} className="mr-1" />
              {isPreviewed ? "Stop Preview" : "Preview"}
            </button>
            {isActiveOverall && (
              <Badge tone="neutral" className="flex-1 text-center py-1.5 text-xs">
                Live
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleRow({
  schedule,
  theme,
  isActive,
  onEdit,
  onDelete,
}: {
  schedule: { id: string; themeId: string; start: string; end: string; enabled: boolean; priority: number };
  theme: ThemeDefinition | undefined;
  isActive: boolean;
  onEdit: () => void;
  onDelete: (formData: FormData) => void;
}) {
  const formatDate = (iso: string) => new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
      isActive ? "border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-900/20" : "border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800/50"
    }`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: theme?.previewGradient || "linear-gradient(135deg, #750787, #b547c9)" }}>
        {theme?.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-ink-900 dark:text-white truncate">{theme?.name || schedule.themeId}</span>
          <Badge tone={schedule.enabled ? (isActive ? "success" : "neutral") : "neutral"}>
            {schedule.enabled ? (isActive ? "Active Now" : "Scheduled") : "Disabled"}
          </Badge>
          <Badge tone="neutral" className="text-xs">Priority: {schedule.priority}</Badge>
        </div>
        <div className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          {formatDate(schedule.start)} → {formatDate(schedule.end)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="btn-ghost btn-sm" title="Edit">
          <IconEdit size={14} />
        </button>
        <ConfirmDeleteButton
          action={onDelete}
          message={`Delete schedule for ${theme?.name || schedule.themeId}?`}
          label="Delete"
          className="btn-ghost btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <IconTrash size={14} />
        </ConfirmDeleteButton>
      </div>
    </div>
  );
}

function ScheduleForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: { id?: string; themeId: string; start: string; end: string; enabled: boolean; priority: number };
  onCancel: () => void;
  onSubmit: (data: Record<string, string>) => void;
}) {
  const [formData, setFormData] = useState({
    scheduleId: initial.id || "",
    themeId: initial.themeId,
    start: initial.start,
    end: initial.end,
    enabled: initial.enabled ? "on" : "",
    priority: String(initial.priority),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(formData)) {
      data[key] = value;
    }
    if (formData.enabled === "on") data.enabled = "true";
    else data.enabled = "false";
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-ink-200 rounded-xl bg-ink-50 dark:border-ink-700 dark:bg-ink-800/50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-ink-900 dark:text-white">{initial.id ? "Edit Schedule" : "Add Schedule"}</h4>
        <button type="button" onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="themeId">Theme</label>
          <select id="themeId" name="themeId" value={formData.themeId} onChange={(e) => setFormData({ ...formData, themeId: e.target.value })} className="select" required>
            {getAllThemes().map((t) => (
              <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="priority">Priority (lower = higher)</label>
          <input id="priority" name="priority" type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input" min="0" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="start">Start Date/Time</label>
          <input id="start" name="start" type="datetime-local" value={formData.start} onChange={(e) => setFormData({ ...formData, start: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="field-label" htmlFor="end">End Date/Time</label>
          <input id="end" name="end" type="datetime-local" value={formData.end} onChange={(e) => setFormData({ ...formData, end: e.target.value })} className="input" required />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
          <input
            type="checkbox"
            name="enabled"
            checked={formData.enabled === "on"}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked ? "on" : "" })}
            className="h-4 w-4 rounded border-ink-300"
          />
          Enabled
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-ink-200 dark:border-ink-700">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Save Schedule</button>
      </div>
    </form>
  );
}