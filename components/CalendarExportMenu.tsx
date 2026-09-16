"use client";

import { useState } from "react";
import { IconCalendar, IconDownload, IconExternal } from "@/components/admin/ui/icons";
import { Button } from "@/components/ui";
import { downloadIcs, getIcsFilename, generateIcsEvent } from "@/lib/ics";

export interface CalendarEvent {
  title: string;
  description?: string | null;
  location?: string | null;
  start: Date;
  end: Date | null;
  timezone?: string | null;
  vrchatWorldUrl?: string | null;
}

interface CalendarExportMenuProps {
  event: CalendarEvent;
}

export function CalendarExportMenu({ event }: CalendarExportMenuProps) {
  const [open, setOpen] = useState(false);

  const startStr = event.start.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const endStr = event.end
    ? event.end.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
    : startStr;
  const details = event.description || event.title;
  const location = event.location || event.vrchatWorldUrl || "";

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/compose?subject=${encodeURIComponent(event.title)}&start=${encodeURIComponent(event.start.toISOString())}&end=${encodeURIComponent(event.end ? event.end.toISOString() : event.start.toISOString())}&body=${encodeURIComponent(details)}`;
  const appleUrl = `https://calendar.apple.com/?start=${Math.floor(event.start.getTime() / 1000)}&end=${Math.floor((event.end ? event.end : event.start).getTime() / 1000)}&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(details)}`;

  const handleIcs = () => {
    const url = downloadIcs({
      title: event.title,
      description: event.description || undefined,
      location: event.location || undefined,
      start: event.start,
      end: event.end,
      timezone: event.timezone,
      url: event.vrchatWorldUrl || undefined,
    });
    const a = document.createElement("a");
    a.href = url;
    a.download = getIcsFilename({ title: event.title, start: event.start });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="outline" size="sm" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
        <IconCalendar size={16} /> Add to calendar
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white p-1 shadow-card-premium dark:border-ink-700 dark:bg-ink-900"
          >
            <Button variant="ghost" role="menuitem" className="w-full justify-start" onClick={() => { window.open(googleUrl, "_blank", "noopener noreferrer"); setOpen(false); }}>
              <IconExternal size={16} /> Google Calendar
            </Button>
            <Button variant="ghost" role="menuitem" className="w-full justify-start" onClick={() => { window.open(outlookUrl, "_blank", "noopener noreferrer"); setOpen(false); }}>
              <IconExternal size={16} /> Outlook
            </Button>
            <Button variant="ghost" role="menuitem" className="w-full justify-start" onClick={() => { window.open(appleUrl, "_blank", "noopener noreferrer"); setOpen(false); }}>
              <IconExternal size={16} /> Apple Calendar
            </Button>
            <div className="my-1 h-px bg-ink-100 dark:bg-ink-800" />
            <Button variant="ghost" role="menuitem" className="w-full justify-start" onClick={handleIcs}>
              <IconDownload size={16} /> Download .ICS file
            </Button>
          </div>
        </>
      )}
    </div>
  );
}