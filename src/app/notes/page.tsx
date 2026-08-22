import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";
import { NoteWithFolder, Category, CATEGORIES } from "@/lib/types";
import { NoteCard } from "@/components/NoteCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

async function getNotes(category?: string): Promise<NoteWithFolder[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("notes")
    .select("*, folders(id, name)")
    .eq("is_draft", false)
    .order("created_at", { ascending: false });

  if (category && CATEGORIES.includes(category as Category)) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return (data as NoteWithFolder[]) || [];
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const notes = await getNotes(category);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Library"
        title="All notes"
        description="Browse by category, or scroll through the full collection."
      />

      <div className="mt-8">
        <Suspense>
          <CategoryFilter />
        </Suspense>
      </div>

      {notes.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="surface mt-12 px-6 py-16 text-center">
          <p className="font-serif text-lg">No notes found</p>
          <p className="mt-1 text-sm text-muted">
            Try another category, or check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
