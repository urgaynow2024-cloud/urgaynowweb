const TYPE_LABELS: Record<string, string> = {
  MAJOR: "Major",
  MINOR: "Minor",
  PATCH: "Patch",
};

export function getUpdateTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}