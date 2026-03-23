import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { NoteWithFolder, Folder } from "@/lib/types";
import { NoteCard } from "@/components/NoteCard";
import { FolderCard } from "@/components/FolderCard";
import { FeaturedNote } from "@/components/FeaturedNote";

export const dynamic = "force-dynamic";

interface FolderWithCount extends Folder {
  note_count: number;
}

async function getRecentNotes(): Promise<NoteWithFolder[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("notes")
    .select("*, folders(id, name)")
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .limit(7);
  return (data as NoteWithFolder[]) || [];
}

async function getFolders(): Promise<FolderWithCount[]> {
  const supabase = getSupabase();
  const [foldersResult, notesResult] = await Promise.all([
    supabase.from("folders").select("*").order("name", { ascending: true }),
    supabase
      .from("notes")
      .select("folder_id")
      .eq("is_draft", false)
      .not("folder_id", "is", null),
  ]);

  const folders = foldersResult.data || [];
  const notes = notesResult.data || [];
  const countMap = new Map<string, number>();
  notes.forEach((n) => {
    if (n.folder_id) {
      countMap.set(n.folder_id, (countMap.get(n.folder_id) || 0) + 1);
    }
  });

  return folders.map((f) => ({
    ...f,
    note_count: countMap.get(f.id) || 0,
  }));
}

export default async function Home() {
  const [notes, folders] = await Promise.all([getRecentNotes(), getFolders()]);

  const featured = notes[0] ?? null;
  const rest = notes.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="py-12 sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Giovanny Espitia&apos;s Notes
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          A collection of textbook notes, paper notes, lecture summaries, and
          explanations. Browse freely.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-muted"
          >
            Browse all notes &rarr;
          </Link>
          <Link
            href="/folders"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-muted"
          >
            View folders &rarr;
          </Link>
        </div>
      </section>

      {featured && (
        <section className="pb-12 sm:pb-16">
          <FeaturedNote note={featured} />
        </section>
      )}

      {folders.length > 0 && (
        <section className="pb-12 sm:pb-16">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-muted">
            Folders
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="pb-16 sm:pb-20">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-muted">
            Recent
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
