import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNotes } from "@/lib/queries";
import { Category, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { NoteList } from "@/components/NoteList";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notes",
  description: "All notes on textbooks, papers, and lectures.",
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORIES.includes(category as Category) ? (category as Category) : null;

  const all = await getPublishedNotes();
  const notes = active ? all.filter((n) => n.category === active) : all;
  const tabs = [
    { key: null, label: "All", count: all.length },
    ...CATEGORIES.map((c) => ({
      key: c,
      label: CATEGORY_LABELS[c],
      count: all.filter((n) => n.category === c).length,
    })).filter((t) => t.count > 0 || t.key === active),
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      <PageHeader
        title="Notes"
        description={`${all.length} ${all.length === 1 ? "note" : "notes"} on textbooks, papers, and lectures, newest first.`}
      />

      <nav aria-label="Filter by category" className="mb-10 border-b border-border">
        <ul className="-mb-px flex gap-6 overflow-x-auto text-sm">
          {tabs.map((tab) => {
            const selected = tab.key === active;
            return (
              <li key={tab.label}>
                <Link
                  href={tab.key ? `/notes?category=${tab.key}` : "/notes"}
                  aria-current={selected ? "page" : undefined}
                  className={`inline-flex items-baseline gap-1.5 whitespace-nowrap border-b-2 pb-3 transition-colors ${
                    selected
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className="font-mono text-[0.6875rem] tabular-nums text-subtle">
                    {tab.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {notes.length > 0 ? (
        <NoteList notes={notes} groupByYear />
      ) : (
        <EmptyState>No notes in this category yet.</EmptyState>
      )}
    </div>
  );
}
