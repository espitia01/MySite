import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";
import { NoteWithFolder, Category, CATEGORIES } from "@/lib/types";
import { NoteCard } from "@/components/NoteCard";
import { CategoryFilter } from "@/components/CategoryFilter";

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight">All Notes</h1>
      <p className="mt-2 text-muted">
        Browse notes by category or scroll through everything.
      </p>

      <div className="mt-8">
        <Suspense>
          <CategoryFilter />
        </Suspense>
      </div>

      {notes.length > 0 ? (
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-muted">No notes found.</p>
        </div>
      )}
    </div>
  );
}
