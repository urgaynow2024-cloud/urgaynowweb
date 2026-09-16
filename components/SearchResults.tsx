"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EventCard } from "@/components/EventCard";
import { StaffCard } from "@/components/StaffCard";
import { ScrollFadeIn } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";
import { Button, FilterBar, FilterChip } from "@/components/ui";

type Result = { href: string; title: string; snippet: string; kind: string };

type Announcement = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: Date | null;
};

type Event = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  vrchatWorldUrl: string;
  coverImage: string;
  startDateTime: Date | string;
  endDateTime: Date | string | null;
  hostName?: string;
  category?: string;
  timezone?: string;
  archivedAt?: Date | string | null;
};

type Staff = {
  id: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  socials: string;
};

const ALL_TYPES = [
  { key: "all", label: "All" },
  { key: "announcements", label: "Announcements" },
  { key: "events", label: "Events" },
  { key: "staff", label: "Staff" },
  { key: "guides", label: "Guides" },
  { key: "gallery", label: "Gallery" },
  { key: "updates", label: "Updates" },
  { key: "partners", label: "Partners" },
  { key: "links", label: "Links" },
];

function SearchResults({
  q,
  announcements,
  events,
  staff,
  guides,
  galleryImages,
  updates,
  partners,
  links,
  activeFilter,
  onFilterChange,
}: {
  q: string;
  announcements: Announcement[];
  events: Event[];
  staff: Staff[];
  guides: Result[];
  galleryImages: Result[];
  updates: Result[];
  partners: Result[];
  links: Result[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  const total =
    announcements.length +
    events.length +
    staff.length +
    guides.length +
    galleryImages.length +
    updates.length +
    partners.length +
    links.length;

  if (!q) {
    return (
      <EmptyState
        icon="🔍"
        title="What can we help you find?"
        description='Type something above to search the site — announcements, guides, staff, events, gallery, updates, and more.'
        className="mt-10"
      />
    );
  }

  if (total === 0) {
    return (
      <EmptyState
        icon="😔"
        title={`No results for “${q}”`}
        description="Try a different keyword or check the spelling."
        className="mt-10"
      />
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <FilterBar label="Result type" className="gap-2">
        {ALL_TYPES.map((t) => (
          <FilterChip
            key={t.key}
            active={activeFilter === t.key}
            onClick={() => onFilterChange(t.key)}
          >
            {t.label}
          </FilterChip>
        ))}
      </FilterBar>

      {(activeFilter === "all" || activeFilter === "announcements") && announcements.length > 0 && (
        <section>
          <h2 className="eyebrow mb-4">Announcements</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.filter((a) => a.publishedAt).map((a) => (
              <ScrollFadeIn key={a.id}>
                <AnnouncementCard
                  item={{
                    id: a.id,
                    title: a.title,
                    slug: a.slug,
                    excerpt: a.excerpt,
                    coverImage: a.coverImage,
                    publishedAt: a.publishedAt ?? new Date(),
                  }}
                />
              </ScrollFadeIn>
            ))}
          </div>
        </section>
      )}

      {(activeFilter === "all" || activeFilter === "events") && events.length > 0 && (
        <section>
          <h2 className="eyebrow mb-4">Events</h2>
          <div className="grid gap-4">
            {events.map((e) => (
              <ScrollFadeIn key={e.id}>
                <EventCard event={e as any} />
              </ScrollFadeIn>
            ))}
          </div>
        </section>
      )}

      {(activeFilter === "all" || activeFilter === "staff") && staff.length > 0 && (
        <section>
          <h2 className="eyebrow mb-4">Staff</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => (
              <ScrollFadeIn key={s.id}>
                <StaffCard
                  staff={{
                    id: s.id,
                    name: s.name,
                    vrchatUsername: s.vrchatUsername,
                    rank: s.rank,
                    bio: s.bio,
                    photoUrl: s.photoUrl,
                    socials: s.socials,
                  }}
                />
              </ScrollFadeIn>
            ))}
          </div>
        </section>
      )}

      {(activeFilter === "all" || activeFilter === "guides") && <SimpleResults title="Guides" results={guides} />}
      {(activeFilter === "all" || activeFilter === "gallery") && <SimpleResults title="Gallery" results={galleryImages} />}
      {(activeFilter === "all" || activeFilter === "updates") && <SimpleResults title="Updates" results={updates} />}
      {(activeFilter === "all" || activeFilter === "partners") && <SimpleResults title="Partners" results={partners} />}
      {(activeFilter === "all" || activeFilter === "links") && <SimpleResults title="Links" results={links} external />}
    </div>
  );
}

function SimpleResults({
  title,
  results,
  external = false,
}: {
  title: string;
  results: Result[];
  external?: boolean;
}) {
  if (results.length === 0) return null;
  return (
    <section>
      <h2 className="eyebrow mb-4">{title}</h2>
      <ul className="card divide-y divide-ink-200 overflow-hidden dark:divide-ink-800">
        {results.map((r, i) => {
          const inner = (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink-900 dark:text-white">{r.title}</p>
                {r.kind && (
                  <span className="badge-neutral shrink-0">{r.kind}</span>
                )}
              </div>
              {r.snippet && (
                <p className="mt-1 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{r.snippet}</p>
              )}
            </>
          );
          return (
            <li key={i}>
              {external ? (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 transition hover:bg-surface-100 dark:hover:bg-ink-800/60"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={r.href}
                  className="block px-4 py-3 transition hover:bg-surface-100 dark:hover:bg-ink-800/60"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function SearchPageClient({
  initialQ,
  initialResults,
}: {
  initialQ: string;
  initialResults: {
    announcements: Announcement[];
    events: Event[];
    staff: Staff[];
    guides: Result[];
    galleryImages: Result[];
    updates: Result[];
    partners: Result[];
    links: Result[];
  };
}) {
  const [q, setQ] = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const handleSearch = (newQ: string) => {
    setQ(newQ);
    setActiveFilter("all");
    if (newQ.trim()) {
      const trimmed = newQ.trim();
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== trimmed);
        const updated = [trimmed, ...filtered].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Search"
        description="Find announcements, guides, staff, events, gallery, updates and more across the community."
      />
      <Container className="py-16">
        <div className="mx-auto max-w-3xl">
          <SearchBox initial={q} autoFocus={!q} onSearch={handleSearch} />
        </div>

        {recentSearches.length > 0 && q === "" && (
          <div className="mt-6 mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="eyebrow">Recent searches</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                localStorage.removeItem("recentSearches");
                setRecentSearches([]);
              }}>
                Clear
              </Button>
            </div>
            <FilterBar label="Recent searches">
              {recentSearches.map((s) => (
                <FilterChip key={s} onClick={() => handleSearch(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterBar>
          </div>
        )}

        <SearchResults
          q={q}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          {...initialResults}
        />
      </Container>
    </>
  );
}